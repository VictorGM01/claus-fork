import pdfplumber
import pandas as pd
import logging
import re
import csv


def extract_text_from_pdf(pdf_path):
    """Extrai o texto de um PDF, concatenando todas as páginas em uma única string."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # Concatena todo o texto das páginas em uma única string
            full_text = ' '.join(page.extract_text()
                                 for page in pdf.pages if page.extract_text())
        return full_text
    except Exception as e:
        logging.error(f"Erro ao extrair texto do PDF: {e}")
        return ""


def clean_text(text):
    """Realiza a limpeza básica do texto removendo múltiplos espaços em branco e quebras de linha."""
    # Remove múltiplos espaços em branco e quebras de linha
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text


def convert_pdf_to_csv(pdf_path: str) -> str:
    """Converte o PDF para CSV e retorna o caminho do arquivo CSV com todo o texto em uma única linha."""
    csv_path = pdf_path.replace('.pdf', '.csv')

    try:
        # Extrai e limpa o texto do PDF
        full_text = extract_text_from_pdf(pdf_path)
        clean_data = clean_text(full_text)

        # Cria um DataFrame com uma única linha contendo todo o texto
        df = pd.DataFrame([[clean_data]], columns=['conteúdo'])

        # Salva o CSV com controle de aspas e delimitadores
        df.to_csv(csv_path, index=False, quoting=csv.QUOTE_MINIMAL)
        logging.info(f"PDF convertido para CSV: {csv_path}")
        return csv_path
    except Exception as e:
        logging.error(f"Erro ao converter PDF para CSV: {e}")
        return ""
