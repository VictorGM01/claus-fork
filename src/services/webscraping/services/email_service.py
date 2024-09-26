import os
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Tuple
from config.settings import SENDER_EMAIL, SMTP_SERVER, SMTP_PORT, EMAIL_PASSWORD
from dotenv import load_dotenv
import requests

# Carregar variáveis de ambiente
load_dotenv()

API_URL = os.getenv('API_URL')

def send_email_notification(downloaded_files: List[Tuple[str, str]], start_date: str, end_date: str):
    """Envia um e-mail notificando sobre os documentos encontrados e baixados."""

    # faz um get para pegar os emails dos usuarios
    response = requests.get(f"{API_URL}/emails")

    # verifica se a resposta foi bem sucedida
    if response.status_code != 200:
        logging.error("Erro ao buscar os emails dos usuários")
        return
    
    # pega os emails dos usuários
    emails = response.json()["data"]

    reveivers = [email["email"] for email in emails]

    logging.info(f"Enviando e-mail de notificação para: {reveivers}")

    # Criação da mensagem
    message = MIMEMultipart()
    message["From"] = SENDER_EMAIL
    message["To"] = ", ".join(reveivers)
    message["Subject"] = f"Documentos CVM encontrados de {
        start_date} a {end_date}"

    # Corpo do e-mail
    body = f"Documentos foram encontrados e baixados para o período de {
        start_date} a {end_date}.\n\n"
    body += "Arquivos baixados e links correspondentes:\n"
    for file_path, pdf_link in downloaded_files:
        body += f"{file_path}: {pdf_link}\n"

    message.attach(MIMEText(body, "plain"))

    # Envio do e-mail
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Segurança (TLS)
            server.login(SENDER_EMAIL, EMAIL_PASSWORD)
            text = message.as_string()
            server.sendmail(SENDER_EMAIL, reveivers, text)
            logging.info("E-mail de notificação enviado com sucesso.")
    except Exception as e:
        logging.error(f"Erro ao enviar e-mail de notificação: {e}")
