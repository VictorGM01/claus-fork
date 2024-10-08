from datetime import datetime
from nltk.corpus import stopwords
import os
import pika
import logging
import pickle
import nltk
from dotenv import load_dotenv
import json
import ast
import re
import unicodedata
import dateparser
from datetime import timedelta, datetime
import string

# Baixar stopwords em português
nltk.download('stopwords')
nltk.download('punkt')
stop_words = set(stopwords.words('portuguese'))

# Configuração do logger
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do RabbitMQ
rabbitmq_url = os.getenv("RABBITMQ_HOST")
rabbitmq_queue = 'core.documents.search'
rabbitmq_queue_response = 'core.documents.search.response'

tag_mapping = {
    'administrador carteira': 'Administradores de Carteiras',
    'administradores carteiras': 'Administradores de Carteiras',
    'agencia classificacao risco credito': 'Agências de Classificação de Risco de Crédito',
    'agencias classificacao risco credito': 'Agências de Classificação de Risco de Crédito',
    'agente fiduciario': 'Agentes Fiduciários',
    'agentes fiduciarios': 'Agentes Fiduciários',
    'alerta': 'Alerta',
    'alertas': 'Alerta',
    'analista valores mobiliarios': 'Analistas de Valores Mobiliários',
    'analistas valores mobiliarios': 'Analistas de Valores Mobiliários',
    'assessor investimento': 'Assessores de Investimento',
    'assessores investimento': 'Assessores de Investimento',
    'ato declaratorio': 'Ato Declaratório',
    'atos declaratorios': 'Ato Declaratório',
    'atuacao irregular': 'Atuação Irregular',
    'atuacoes irregulares': 'Atuação Irregular',
    'audiencia publica': 'Audiência Pública',
    'audiencias publicas': 'Audiência Pública',
    'auditor independente': 'Auditor Independente',
    'auditores independentes': 'Auditor Independente',
    'bdr': 'BDR',
    'bdrs': 'BDR',
    'cadastro participante regulado': 'Cadastro de Participantes Regulados',
    'cadastro participantes regulados': 'Cadastro de Participantes Regulados',
    'clube investimento': 'Clubes de Investimento',
    'clubes investimento': 'Clubes de Investimento',
    'companhia': 'Companhia',
    'companhias': 'Companhia',
    'comunicado mercado': 'Comunicado ao Mercado',
    'comunicados mercado': 'Comunicado ao Mercado',
    'concurso premio': 'Concurso/Prêmio',
    'concursos premios': 'Concurso/Prêmio',
    'consultor valores mobiliarios': 'Consultores de Valores Mobiliários',
    'consultores valores mobiliarios': 'Consultores de Valores Mobiliários',
    'convenio': 'Convênio',
    'convenios': 'Convênio',
    'coronavirus': 'Coronavirus',
    'corretora': 'Corretora',
    'corretoras': 'Corretora',
    'crowdfunding': 'Crowdfunding',
    'decisao colegiado': 'Decisão do Colegiado',
    'decisoes colegiado': 'Decisão do Colegiado',
    'deliberacao': 'Deliberação',
    'deliberacoes': 'Deliberação',
    'educacao financeira': 'Educação Financeira',
    'educacoes financeiras': 'Educação Financeira',
    'evento': 'Evento',
    'eventos': 'Evento',
    'fundo investimento': 'Fundos de Investimento',
    'fundos investimento': 'Fundos de Investimento',
    'fundo investimento direitos creditorios': 'Fundos de Investimento em Direitos Creditórios',
    'fundos investimento direitos creditorios': 'Fundos de Investimento em Direitos Creditórios',
    'fundo investimento participacoes': 'Fundos de Investimento em Participações',
    'fundos investimento participacoes': 'Fundos de Investimento em Participações',
    'fundo investimento imobiliario': 'Fundos de Investimento Imobiliários',
    'fundos investimento imobiliarios': 'Fundos de Investimento Imobiliários',
    'gestao institucional': 'Gestão Institucional',
    'gestoes institucionais': 'Gestão Institucional',
    'indenizacao': 'Indenização',
    'indenizacoes': 'Indenização',
    'infraestrutura mercado': 'Infraestrutura do Mercado',
    'infraestruturas mercado': 'Infraestrutura do Mercado',
    'insider trading': 'Insider Trading',
    'intermediario': 'Intermediários',
    'intermediarios': 'Intermediários',
    'investidor nao residente': 'Investidores Nao Residentes',
    'investidores nao residentes': 'Investidores Nao Residentes',
    'julgamento': 'Julgamento',
    'julgamentos': 'Julgamento',
    'julgamento insider': 'Julgamento_Insider',
    'julgamentos insider': 'Julgamento_Insider',
    'mercado organizado': 'Mercados Organizados',
    'mercados organizados': 'Mercados Organizados',
    'norma contabel': 'Normas Contábeis',
    'normas contabeis': 'Normas Contábeis',
    'nota': 'Nota',
    'notas': 'Nota',
    'oferta publica': 'Ofertas Publicas',
    'ofertas publicas': 'Ofertas Publicas',
    'oficio circular': 'Ofício Circular',
    'oficios circulares': 'Ofício Circular',
    'ouvidoria': 'Ouvidoria',
    'parecer orientacao': 'Parecer de Orientação',
    'pareceres orientacao': 'Parecer de Orientação',
    'pesquisa': 'Pesquisa',
    'pesquisas': 'Pesquisa',
    'planejamento estrategico': 'Planejamento Estratégico',
    'planejamentos estrategicos': 'Planejamento Estratégico',
    'pld ftp': 'PLD/FTP',
    'processo eletronico': 'Processo Eletrônico',
    'processos eletronicos': 'Processo Eletrônico',
    'protocolo digital': 'Protocolo Digital',
    'protocolos digitais': 'Protocolo Digital',
    'publicacao': 'Publicação',
    'publicacoes': 'Publicação',
    'ritos cvm': 'Ritos CVM',
    'sandbox regulatorio': 'Sandbox Regulatório',
    'sandboxs regulatorios': 'Sandbox Regulatório',
    'securitizadora': 'Securitizadoras',
    'securitizadoras': 'Securitizadoras',
    'sistema governanca gestao cvm': 'Sistema de governança e gestão da CVM',
    'sistemas governanca gestao cvm': 'Sistema de governança e gestão da CVM',
    'suitability': 'Suitability',
    'suspensao': 'Suspensão',
    'suspensoes': 'Suspensão',
    'tecnologia informacao': 'Tecnologia da Informação',
    'tecnologias informacao': 'Tecnologia da Informação',
    'termo compromisso': 'Termo de Compromisso',
    'termos compromisso': 'Termo de Compromisso',
    'termo compromisso insider': 'Termo_Compromisso_Insider',
    'termos compromisso insider': 'Termo_Compromisso_Insider'
}

tipo_mapping = {
    'instrucao': 'Instruções',
    'instrucoes': 'Instruções',
    'parecer orientacao': 'Pareceres de Orientação',
    'pareceres orientacao': 'Pareceres de Orientação',
    'deliberacao': 'Deliberações',
    'deliberacoes': 'Deliberações',
    'decisao conjunta': 'Decisões Conjuntas',
    'decisoes conjuntas': 'Decisões Conjuntas',
    'oficio circular': 'Ofícios Circulares',
    'oficios circulares': 'Ofícios Circulares',
    'lei decreto': 'Leis e Decretos',
    'leis decretos': 'Leis e Decretos',
    'nota explicativa': 'Notas Explicativas',
    'notas explicativas': 'Notas Explicativas'
}



def load_model_and_vectorizer():
    logger.info("Carregando o modelo treinado e o vetor TF-IDF.")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, '../models/intent/model.pkl')
    vectorizer_path = os.path.join(base_dir, '../models/intent/vectorizer.pkl')

    try:
        with open(model_path, 'rb') as model_file:
            model = pickle.load(model_file)
        with open(vectorizer_path, 'rb') as vectorizer_file:
            vectorizer = pickle.load(vectorizer_file)
    except FileNotFoundError as e:
        logger.error(f"Erro ao carregar o modelo ou arquivos associados: {e}")
        raise

    return model, vectorizer


def publish_message_to_queue(channel, queue_name, message):
    """
    Publica uma mensagem na fila especificada.
    """
    encoded_message = json.dumps(message, ensure_ascii=False).encode('utf-8')

    # cria fila se não existir
    channel.queue_declare(queue=queue_name)

    channel.basic_publish(
        exchange='',
        routing_key=queue_name,
        body=encoded_message,
    )
    logger.info(f"Mensagem publicada na fila {queue_name}.")


def preprocess_text(text):
    # Converte para minúsculas
    text = text.lower()

    # Remove pontuações
    text = text.translate(str.maketrans('', '', string.punctuation))

    # Remove espaços em branco extras
    text = text.strip()

    # Remove stopwords
    filtered_words = filter(lambda word: word not in stop_words, text.split())
    text = " ".join(filtered_words)

    # Remove acentos
    text = ''.join((c for c in unicodedata.normalize(
        'NFD', text) if unicodedata.category(c) != 'Mn'))

    return text


def extract_dates(text):
    # Converte o texto para minúsculas e corrige palavras que podem estar sem acentuação
    text = text.lower()
    text = text.replace('mes', 'mês').replace('ate', 'até')

    extracted_dates = []

    # Data atual para cálculos de datas relativas
    today = datetime.now()

    # Verifica se o texto contém intervalos de datas nos formatos "de DD/MM/AAAA até DD/MM/AAAA" ou "entre DD/MM/AAAA e DD/MM/AAAA"
    interval_match = re.search(r'de (\d{1,2}/\d{1,2}/\d{2,4}) até (\d{1,2}/\d{1,2}/\d{2,4})', text, re.IGNORECASE) or \
        re.search(
            r'entre (\d{1,2}/\d{1,2}/\d{2,4}) e (\d{1,2}/\d{1,2}/\d{2,4})', text, re.IGNORECASE)

    if interval_match:
        # Se um intervalo for encontrado, extrai as duas datas, processa e converte para o formato 'YYYY-MM-DD'
        start_date_str, end_date_str = interval_match.groups()
        start_date = dateparser.parse(start_date_str, languages=['pt'])
        end_date = dateparser.parse(end_date_str, languages=['pt'])
        extracted_dates.append((start_date.strftime(
            '%Y-%m-%d'), end_date.strftime('%Y-%m-%d')))
    else:
        # Se não há intervalo, a função procura por datas individuais ou expressões de tempo relativas
        date_matches = re.findall(
            r'\b(?:\d{1,2}/\d{1,2}/\d{2,4}|\d{1,2} de \w+ de \d{4}|hoje|ontem|anteontem|semana passada|semana atual|essa semana|dessa semana|mês passado|mês atual|desse mês|neste mês|ano passado|ano atual|nesse ano|este ano|há \d+ (?:dias|semanas|meses|anos))\b',
            text, re.IGNORECASE
        )

        for date_str in date_matches:
            # Identifica "semana atual", "mês atual", "ano atual", etc.
            if "semana atual" in date_str or "essa semana" in date_str or "dessa semana" in date_str:
                start_of_week = today - timedelta(days=today.weekday())
                end_of_week = start_of_week + timedelta(days=6)
                extracted_dates.append((start_of_week.strftime(
                    '%Y-%m-%d'), end_of_week.strftime('%Y-%m-%d')))

            elif "mês atual" in date_str or "desse mês" in date_str or "neste mês" in date_str:
                start_of_month = today.replace(day=1)
                end_of_month = (today.replace(
                    day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                extracted_dates.append((start_of_month.strftime(
                    '%Y-%m-%d'), end_of_month.strftime('%Y-%m-%d')))

            elif "ano atual" in date_str or "nesse ano" in date_str or "este ano" in date_str:
                start_of_year = today.replace(month=1, day=1)
                end_of_year = today.replace(month=12, day=31)
                extracted_dates.append((start_of_year.strftime(
                    '%Y-%m-%d'), end_of_year.strftime('%Y-%m-%d')))

            else:
                # Para outras datas relativas
                parsed_date = dateparser.parse(date_str, languages=['pt'])

                if parsed_date:
                    if "semana passada" in date_str:
                        start_of_week = parsed_date - \
                            timedelta(days=parsed_date.weekday() + 1)
                        end_of_week = start_of_week + timedelta(days=6)
                        extracted_dates.append((start_of_week.strftime(
                            '%Y-%m-%d'), end_of_week.strftime('%Y-%m-%d')))

                    elif "mês passado" in date_str:
                        start_of_month = parsed_date.replace(day=1)
                        end_of_month = (parsed_date.replace(
                            day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                        extracted_dates.append((start_of_month.strftime(
                            '%Y-%m-%d'), end_of_month.strftime('%Y-%m-%d')))

                    elif "ano passado" in date_str:
                        start_of_year = parsed_date.replace(month=1, day=1)
                        end_of_year = parsed_date.replace(month=12, day=31)
                        extracted_dates.append((start_of_year.strftime(
                            '%Y-%m-%d'), end_of_year.strftime('%Y-%m-%d')))

                    else:
                        # Para datas absolutas ou outras expressões relativas que não representam intervalos,
                        # converte a data para um intervalo de um único dia
                        extracted_dates.append((parsed_date.strftime(
                            '%Y-%m-%d'), parsed_date.strftime('%Y-%m-%d')))

    # Retorna uma lista de intervalos de datas encontrados, no formato [['YYYY-MM-DD', 'YYYY-MM-DD'], ...]
    return extracted_dates if extracted_dates else None


def extract_parameters(utterance, processed_utterance):
    # Expressões regulares para identificar tipos de documentos, tags e órgão regulador.
    document_type_regex = r'(' + '|'.join(tipo_mapping.keys()) + r')'
    tags_regex = r'(' + '|'.join(tag_mapping.keys()) + r')'
    entity_regex = r'cvm'

    # Realiza a busca no texto processado para identificar o tipo de documento, tags e órgão regulador.
    document_type = re.search(document_type_regex, processed_utterance)
    tags = re.findall(tags_regex, processed_utterance)
    entity = re.search(entity_regex, processed_utterance)

    # Extrai as datas do texto sem processamento
    dates = extract_dates(utterance)

    # Mapeia as tags para os nomes corretamente formatados
    if tags:
        tags = [tag_mapping.get(tag, tag) for tag in tags]

    # Mapeia o tipo de documento para o nome corretamente formatado
    # Só que, diferente da tag, o tipo de documento é um valor fixo e unitário
    if document_type:
        document_type = tipo_mapping.get(
            document_type.group(0), document_type.group(0))

    return {
        'document_type': document_type if document_type else None,
        'tags': tags if tags else [],
        'entity': entity.group(0) if entity else None,
        'dates': dates if dates else None
    }


def predict_and_extract(utterance, model, vectorizer):
    # Pré-processa a entrada
    processed_utterance = preprocess_text(utterance)

    # Converte o texto pré-processado em uma matriz vetorial TF-IDF
    vectorized_utterance = vectorizer.transform([processed_utterance])

    # Utiliza o modelo treinado para prever a intenção
    prediction = model.predict(vectorized_utterance)[0]

    # Se a intenção for "consulta_normativa", extrai parâmetros adicionais
    if prediction == "consulta_normativa":
        parameters = extract_parameters(utterance, processed_utterance)
        logger.info(f"Intenção: {prediction}")
        logger.info(f"Parâmetros Extraídos: {parameters}")
        return parameters
    else:
        # Se a intenção não for relevante para o escopo do projeto, apenas imprime a intenção prevista
        logger.info(f"Intenção fora do escopo do projeto")


def process_message(ch, method, properties, body):
    logger.info("Mensagem recebida do RabbitMQ para processamento.")
    message = None

    # Decodificar a mensagem JSON
    try:
        # Tentar decodificar a mensagem JSON
        message = json.loads(body.decode('utf-8'))
    except json.JSONDecodeError:
        # Se falhar, tentar usar ast.literal_eval para converter para um dicionário Python
        message = ast.literal_eval(body.decode('utf-8'))

    # Extrair o texto do conteúdo da mensagem
    utterance = message.get('input')
    correlation_id = message.get('correlationId')

    logger.info(f"Correlation ID: {correlation_id}")
    logger.info(f"Conteúdo da mensagem: {utterance}")

    if not utterance:
        logger.error("Conteúdo não encontrado na mensagem.")
        return

    logger.info(f"Processando a mensagem: {utterance}")

    # Carregar o modelo e o vetor TF-IDF
    model, vectorizer = load_model_and_vectorizer()

    # Prever intenção e extrair parâmetros, se aplicável
    parameters = predict_and_extract(utterance, model, vectorizer)

    if parameters is None:
        # Intenção fora do escopo, retornar erro
        response_message = {
            'correlationId': correlation_id,
            'input': utterance,
            'data': {
                'tipo_documento': None,
                'tags': [],
                'orgao': None,
                'datas': []
            },  # Nenhum dado será retornado
            'error': "Intenção fora do escopo do projeto. Nenhuma busca será realizada."
        }
    else:
        # Extrair os parâmetros normalmente se a intenção for válida (consulta_normativa)
        parametros = {
            'tipo_documento': parameters.get('document_type'),
            'tags': parameters.get('tags'),
            'orgao': parameters.get('entity'),
            'datas': parameters.get('dates')
        }

        # Preparar a resposta com os parâmetros extraídos
        response_message = {
            'correlationId': correlation_id,
            'input': utterance,
            'data': parametros, # Parâmetros extraídos
            'error': None  # Nenhum erro, pois a intenção é válida
        }

    logger.info(f"Resposta: {response_message}")

    # Publicar a resposta na fila de resposta
    publish_message_to_queue(ch, rabbitmq_queue_response, response_message)


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
