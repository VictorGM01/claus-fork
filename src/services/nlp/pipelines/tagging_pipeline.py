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
updated_tags_queue = 'core.documents.updated-tags'

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
    filename = message.get('filename')

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
            "filename": filename,
            "b2_url": csv_url
        }
        send_post_to_api(document_data)

    logger.info(f"Processamento completo. Resultados enviados para a API.")

    # Mostrar o conteúdo do arquivo
    print(result_df.head())


def append_to_training_data(df_new):
    training_data_path = 'data/processed/training_data.csv'

    if not os.path.exists('data'):
        os.makedirs('data')
    if not os.path.exists('data/processed'):
        os.makedirs('data/processed')

    # mostra quais dados estão sendo adicionados
    logger.info(f"Adicionando novos dados à base de treinamento: {df_new}")
    if os.path.exists(training_data_path):
        df_existing = pd.read_csv(training_data_path)

        # quantidade de linhas antes
        logger.info(f"Linhas antes: {len(df_existing)}")

        # Concatenar os novos dados com os existentes
        df_combined = pd.concat([df_existing, df_new], ignore_index=True)

        # mantém apenas o último registro, se tiver mais de uma linha para o mesmo filename
        df_combined.drop_duplicates(
            subset='filename', keep='last', inplace=True)

        # quantidade de linhas depois
        logger.info(f"Linhas depois: {len(df_combined)}")
    else:
        df_combined = df_new

    # Salvar a base de treinamento atualizada
    df_combined.to_csv(training_data_path, index=False)
    logger.info("Novos dados adicionados à base de treinamento.")


def process_updated_tags_message(ch, method, properties, body):
    logger.info("Mensagem recebida na fila de atualização de tags.")
    message = None

    # Decodificar a mensagem JSON
    try:
        message = json.loads(body.decode())
    except json.JSONDecodeError:
        message = ast.literal_eval(body.decode())

    logger.info(f"Mensagem decodificada: {message}")

    # Extrair informações da mensagem
    csv_url = message.get('csv_path')  # URL do CSV na B2
    filename = message.get('filename')  # Nome do arquivo
    corrected_tags = message.get('corrected_tags')  # Lista de tags corretas

    if not csv_url or not corrected_tags or not filename:
        logger.error("Informações insuficientes na mensagem.")
        return

    # Fazer download do CSV do Backblaze B2
    csv_path = download_from_backblaze(csv_url)

    # Carregar o CSV
    df_new = pd.read_csv(csv_path)

    # Verificar se a coluna 'conteúdo' está presente
    if 'conteúdo' not in df_new.columns:
        logger.error("Coluna 'conteúdo' não encontrada no CSV.")
        return

    # Adicionar as novas informações ao DataFrame
    df_new['filename'] = filename
    # tags é uma lista, mas precisamos deixar uma string de itens separados por vírgula
    df_new['tags'] = ", ".join(corrected_tags)
    df_new.rename(columns={'conteúdo': 'text'}, inplace=True)

    # Selecionar apenas as colunas relevantes
    df_new = df_new[['filename', 'text', 'tags']]

    # Salvar os novos dados na base de treinamento
    append_to_training_data(df_new)


def listen_to_rabbitmq():
    # Configuração do RabbitMQ
    parameters = pika.URLParameters(rabbitmq_url)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    # Declaração das filas
    channel.queue_declare(queue=rabbitmq_queue)
    channel.queue_declare(queue=updated_tags_queue)

    # Consumir mensagens das filas
    channel.basic_consume(queue=rabbitmq_queue,
                          on_message_callback=process_message, auto_ack=True)
    channel.basic_consume(queue=updated_tags_queue,
                          on_message_callback=process_updated_tags_message, auto_ack=True)

    logger.info(f"Escutando mensagens nas filas: {
                rabbitmq_queue} e {updated_tags_queue}")
    channel.start_consuming()


if __name__ == "__main__":
    listen_to_rabbitmq()
