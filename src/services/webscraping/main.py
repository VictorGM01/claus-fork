from datetime import datetime, timedelta
from scraping.driver_setup import setup_driver
from services.rabbitmq import connect_rabbitmq, publish_to_rabbitmq
from services.backblaze import authenticate_b2
from scraping.scraper import click_and_download_pdfs
from services.email_service import send_email_notification
import os
import logging
from helpers.helpers import generate_url
from config.logger import configure_logger

configure_logger()


def main():
    """Função principal para executar o script de web scraping."""
    download_dir = 'downloads'

    # Configurações
    if not os.path.exists(download_dir):
        os.makedirs(download_dir)

    driver = setup_driver(download_dir)

    channel = connect_rabbitmq()
    b2_api, bucket = authenticate_b2()

    if not channel or not bucket:
        logging.error(
            "Conexão com RabbitMQ ou Backblaze B2 falhou. Encerrando.")
        return

    # Processo de scraping
    try:
        start_date = datetime.now() - timedelta(days=1)
        end_date = datetime.now()

        logging.info("Data de início: %s", start_date.strftime('%d/%m/%Y'))
        logging.info("Data final: %s", end_date.strftime('%d/%m/%Y'))

        url = generate_url(start_date, end_date)
        logging.info("Acessando URL: %s", url)

        driver.get(url)
        logging.info("Página da CVM acessada com parâmetros.")

        documents_data = click_and_download_pdfs(driver, download_dir, bucket)

        for document_data in documents_data:
            publish_to_rabbitmq(channel, document_data)

        if documents_data:
            send_email_notification([(doc['pdf_path'], doc['link']) for doc in documents_data],
                                    start_date.strftime('%d/%m/%Y'),
                                    end_date.strftime('%d/%m/%Y'))
    finally:
        driver.quit()
        logging.info("Driver encerrado.")


if __name__ == "__main__":
    main()
