import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Configuração do RabbitMQ
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST")
RABBITMQ_QUEUE = 'scraping.documents.extracted'

# Configuração do Backblaze B2
B2_APPLICATION_KEY_ID = os.getenv('B2_APPLICATION_KEY_ID')
B2_APPLICATION_KEY = os.getenv('B2_APPLICATION_KEY')
B2_BUCKET_NAME = 'claus-bofa'

# Configuração de E-mail
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = 587
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Configuração do Web Scraping
SELECTORS = {
    'no_results': '/html/body/section/div[4]/div/section/section/form/div/span',
    'total_results': '//div[@class="col-sm-6 no-padding"]/span',
    'max_items_dropdown': '//*[@id="itensPagina_chosen"]/a',
    'max_items_option': '//*[@id="itensPagina_chosen"]/div/ul/li[text()="50"]',
    'article_link': './/h3/a'
}
