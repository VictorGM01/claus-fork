import pika
import logging

from config.settings import RABBITMQ_HOST, RABBITMQ_QUEUE


def connect_rabbitmq():
    """Conecta ao RabbitMQ e retorna o canal."""
    parameters = pika.URLParameters(RABBITMQ_HOST)

    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()

        # Coloca o canal em modo de confirmação
        channel.confirm_delivery()
        channel.queue_declare(queue=RABBITMQ_QUEUE)
        logging.info("Conexão com RabbitMQ estabelecida com sucesso.")
        return channel
    except pika.exceptions.AMQPConnectionError as e:
        logging.error(f"Erro ao conectar ao RabbitMQ: {e}")
        return None


def publish_to_rabbitmq(channel, document_data: dict):
    """Publica os dados do documento no RabbitMQ."""
    try:
        channel.basic_publish(
            exchange='',
            routing_key=RABBITMQ_QUEUE,
            body=str(document_data)
        )
        logging.info(f"Documento publicado no RabbitMQ com sucesso: {
                     document_data}")
    except pika.exceptions.UnroutableError:
        logging.error(f"Mensagem não foi roteada: {document_data}")
    except Exception as e:
        logging.error(f"Erro ao publicar documento no RabbitMQ: {e}")
