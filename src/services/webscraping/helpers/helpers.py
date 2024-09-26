from typing import List, Optional, Tuple
import os
import logging
import urllib.parse
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from config.settings import SELECTORS
from datetime import datetime


def get_pdf_link(article_link: str) -> Optional[List[str]]:
    """Converte o link do artigo no link direto para o PDF, tentando múltiplas opções."""
    parsed_url = urllib.parse.urlparse(article_link)
    path_parts = parsed_url.path.split('/')
    category = path_parts[2]
    subfolder = path_parts[3]
    filename = path_parts[4].replace('.html', '')

    pdf_links = []

    if category == 'oficios-circulares':
        if "snc-sep" in subfolder:
            pdf_filename = filename.replace('_', '')
            pdf_links.append(f"https://conteudo.cvm.gov.br/export/sites/cvm/legislacao/{
                             category}/{subfolder}/anexos/{pdf_filename}.pdf")
        elif "sse1" in subfolder:
            pdf_links.append(f"https://conteudo.cvm.gov.br/export/sites/cvm/legislacao/{
                             category}/{subfolder}/anexos/{filename}-.pdf")
            pdf_links.append(f"https://conteudo.cvm.gov.br/export/sites/cvm/legislacao/{
                             category}/{subfolder}/anexos/oc-sse-{filename[-4:]}.pdf")
        else:
            pdf_links.append(f"https://conteudo.cvm.gov.br/export/sites/cvm/legislacao/{
                             category}/{subfolder}/anexos/{filename}.pdf")
    elif category == 'deliberacoes':
        subfolder_num = subfolder[4:]
        pdf_links.append(f"https://conteudo.cvm.gov.br/export/sites/cvm/legislacao/{
                         category}/anexos/{subfolder_num}/{filename}.pdf")
    else:
        logging.error("Categoria %s não reconhecida para o link: %s",
                      category, article_link)
        return None

    return pdf_links


def extract_article_info(article) -> Tuple[str, str, str]:
    """Extrai o tipo de documento, a data e o link do artigo."""
    try:
        # Extrai o link do artigo
        link_element = article.find_element(
            By.XPATH, SELECTORS['article_link'])
        article_url = link_element.get_attribute('href')
        logging.info("Processando artigo: %s", article_url)

        # Extrai a data de publicação
        date_element = article.find_element(
            By.XPATH, ".//p[b[text()='Data:']]")
        publication_date = date_element.text.replace("Data: ", "").strip()

        # formata publication_date para em vez de DD/MM/YYYY para YYYY-MM-DD
        publication_date = datetime.strptime(
            publication_date, '%d/%m/%Y').strftime('%Y-%m-%d')

        # Extrai o tipo de documento
        type_element = article.find_element(
            By.XPATH, ".//p[b[text()='Tipo:']]")
        document_type = type_element.text.replace("Tipo: ", "").strip()

        # Extrai o nome do a
        nome = article.find_element(By.XPATH, ".//h3/a").text

        return article_url, publication_date, document_type, nome
    except Exception as e:
        logging.error("Erro ao extrair informações do artigo: %s", e)
        return None, None, None


def generate_url(start_date: datetime, end_date: datetime) -> str:
    """Gera a URL com os parâmetros de data e categorias."""
    base_url = "https://conteudo.cvm.gov.br/legislacao/index.html?"
    params = {
        "numero": "",
        "lastNameShow": "",
        "lastName": "",
        "filtro": "todos",
        "dataInicio": start_date.strftime('%d/%m/%Y'),
        "dataFim": end_date.strftime('%d/%m/%Y'),
        "categoria0": "/legislacao/instrucoes/",
        "categoria1": "/legislacao/pareceres-orientacao/",
        "categoria2": "/legislacao/deliberacoes/",
        "categoria3": "/legislacao/decisoesconjuntas/",
        "categoria4": "/legislacao/oficios-circulares/",
        "categoria5": "/legislacao/leis-decretos/",
        "categoria6": "/legislacao/notas-explicativas/",
        "buscado": "false",
        "contCategoriasCheck": "7"
    }
    return base_url + "&".join([f"{key}={value}" for key, value in params.items()])
