import os
import pika
import pandas as pd
import logging
import pickle
import nltk
from dotenv import load_dotenv
import requests
import json
import ast

# Baixar stopwords em português
nltk.download('stopwords')
nltk.download('punkt')

# Configuração do logger
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do RabbitMQ
rabbitmq_url = os.getenv("RABBITMQ_HOST")
rabbitmq_queue = 'scraping.documents.extracted'

# Configuração do Backblaze B2
B2_APPLICATION_KEY_ID = os.getenv('B2_APPLICATION_KEY_ID')
B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
B2_BUCKET_NAME = 'claus-bofa'

# Configuração da API
API_URL = os.getenv('API_URL')


def download_from_backblaze(file_url):
    logger.info(f"Baixando arquivo do Backblaze B2: {file_url}")
    response = requests.get(file_url)
    if not os.path.exists('downloads'):
        os.makedirs('downloads')
    file_path = os.path.join('downloads', os.path.basename(file_url))
    with open(file_path, 'wb') as f:
        f.write(response.content)
    logger.info(f"Arquivo baixado: {file_path}")
    return file_path


def load_model_and_vectorizer():
    logger.info("Carregando o modelo treinado e o vetor TF-IDF.")

    # Calcula o caminho absoluto
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, '../models/tagging/model.pkl')
    vectorizer_path = os.path.join(
        base_dir, '../models/tagging/vectorizer.pkl')
    mlb_path = os.path.join(base_dir, '../models/tagging/mlb.pkl')

    try:
        with open(model_path, 'rb') as model_file:
            model = pickle.load(model_file)
        with open(vectorizer_path, 'rb') as vectorizer_file:
            vectorizer = pickle.load(vectorizer_file)
        with open(mlb_path, 'rb') as mlb_file:
            mlb = pickle.load(mlb_file)
    except FileNotFoundError as e:
        logger.error(f"Erro ao carregar o modelo ou arquivos associados: {e}")
        raise

    return model, vectorizer, mlb


def apply_model_to_csv(model, vectorizer, mlb_classes, csv_path):
    # Carregar o CSV
    logger.info(f"Carregando CSV para processamento: {csv_path}")
    df = pd.read_csv(csv_path)

    # Pré-processamento
    df['processed_text'] = df['conteúdo'].apply(
        lambda x: ' '.join(vectorizer.build_tokenizer()(x.lower())))

    # Vetorização
    X = vectorizer.transform(df['processed_text'])

    # Previsão
    predictions = model.predict(X)

    # Transformar as previsões de volta para tags legíveis
    predicted_tags = [[mlb_classes[i] for i in range(
        len(mlb_classes)) if pred[i] == 1] for pred in predictions]
    df['predicted_tags'] = [', '.join(tags) for tags in predicted_tags]

    return df[['conteúdo', 'predicted_tags']]


def send_post_to_api(document_data):
    """Envia um POST para a API com os dados do documento."""
    url = f"{API_URL}/documents/webhook/save"
    logger.info(f"Enviando dados para a API: {document_data}")

    try:
        response = requests.post(url, json=document_data)
        response.raise_for_status()
        logger.info(f"Dados enviados com sucesso para a API: {document_data}")
    except requests.RequestException as e:
        logger.error(f"Erro ao enviar dados para a API: {e}")


def process_message(ch, method, properties, body):
    logger.info("Mensagem recebida do RabbitMQ para processamento.")
    message = None

    # Decodificar a mensagem JSON
    try:
        # Tentar decodificar a mensagem JSON
        message = json.loads(body.decode())
    except json.JSONDecodeError:
        # Se falhar, tentar usar ast.literal_eval para converter para um dicionário Python
        message = ast.literal_eval(body.decode())

    logger.info(f"Mensagem decodificada: {message}")

    # Extrair informações da mensagem
    document_type = message.get('tipo')
    csv_url = message.get('csv_path')
    document_date = message.get('data')
    document_link = message.get('link')
    document_name = message.get('nome')

    if not csv_url:
        logger.error("Caminho do CSV não encontrado na mensagem.")
        return

    # Fazer download do CSV do Backblaze B2
    csv_path = download_from_backblaze(csv_url)

    # Carregar o modelo e o vetor TF-IDF
    model, vectorizer, mlb = load_model_and_vectorizer()

    # Aplicar o modelo ao CSV
    result_df = apply_model_to_csv(model, vectorizer, mlb, csv_path)

    # Enviar cada documento processado para a API
    for index, row in result_df.iterrows():
        document_data = {
            "link": document_link,  # Usando o link da mensagem
            "data_publicacao": document_date,  # Usando a data da mensagem
            "tags": row['predicted_tags'].split(', '),  # Tags previstas
            "tipo": document_type,
            "nome": document_name,
        }
        send_post_to_api(document_data)

    logger.info(f"Processamento completo. Resultados enviados para a API.")

    # Mostrar o conteúdo do arquivo
    print(result_df.head())


def listen_to_rabbitmq():
    # Configuração do RabbitMQ
    parameters = pika.URLParameters(rabbitmq_url)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    # Declaração da fila (caso ainda não exista)
    channel.queue_declare(queue=rabbitmq_queue)

    # Consumir mensagens da fila
    channel.basic_consume(queue=rabbitmq_queue,
                          on_message_callback=process_message, auto_ack=True)

    logger.info(f"Escutando mensagens na fila: {rabbitmq_queue}")
    channel.start_consuming()


if __name__ == "__main__":
    listen_to_rabbitmq()
