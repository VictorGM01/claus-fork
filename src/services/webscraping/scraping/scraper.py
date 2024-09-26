import os
import time
import logging
from typing import List, Tuple
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver
from scraping.pdf_processing import convert_pdf_to_csv
from helpers.helpers import get_pdf_link, extract_article_info
from config.settings import SELECTORS
from services.backblaze import upload_to_backblaze
import requests


def retry_failed_downloads(failed_files: List[str], download_dir: str, downloaded_files: List[Tuple[str, str]]) -> List[str]:
    """Tenta novamente baixar os PDFs diretamente usando as URLs dos artigos que falharam."""
    logging.info("Tentando baixar novamente os arquivos que falharam...")
    still_failed_files = []

    for article_url in failed_files:
        if "export/sites" in article_url:
            logging.error("URL incorreta para retry: %s", article_url)
            still_failed_files.append(article_url)
            continue

        pdf_links = get_pdf_link(article_url)
        if not pdf_links:
            logging.error(
                "Não foi possível gerar o link do PDF para: %s", article_url)
            still_failed_files.append(article_url)
            continue

        pdf_filename = os.path.basename(pdf_links[0])
        save_path = os.path.join(download_dir, pdf_filename)
        download_pdf(pdf_links, save_path,
                     downloaded_files, still_failed_files)

    logging.info("Total de arquivos que ainda falharam após o retry: %s", len(
        still_failed_files))
    for file in still_failed_files:
        logging.info(file)

    return still_failed_files


def get_total_results(driver: webdriver.Chrome) -> int:
    """Obtém o número total de resultados encontrados na página."""
    try:
        no_results_element = driver.find_element(
            By.XPATH, SELECTORS['no_results'])
        if no_results_element and "Nenhum resultado encontrado" in no_results_element.text:
            logging.info("Nenhum resultado encontrado na pesquisa.")
            return 0

        total_results_text = driver.find_element(
            By.XPATH, SELECTORS['total_results']).text
        total_results = int(total_results_text.split()[0])
        logging.info(
            "Número total de resultados encontrados: %s", total_results)
        return total_results
    except Exception as e:
        logging.error("Erro ao obter o número total de resultados: %s", e)
        return 0


def select_max_items_per_page(driver: webdriver.Chrome, max_attempts: int = 5) -> None:
    """Tenta expandir o dropdown personalizado e selecionar o valor máximo de itens por página (50) até ter sucesso."""
    attempts = 0
    while attempts < max_attempts:
        try:
            wait = WebDriverWait(driver, 10)
            dropdown = wait.until(EC.element_to_be_clickable(
                (By.XPATH, SELECTORS['max_items_dropdown'])))
            current_value = dropdown.find_element(By.TAG_NAME, 'span').text
            if current_value == "50":
                logging.info(
                    "O valor máximo de itens por página já está selecionado: 50")
                return

            dropdown.click()
            logging.info("Dropdown expandido.")

            option_50 = wait.until(EC.element_to_be_clickable(
                (By.XPATH, SELECTORS['max_items_option'])))
            option_50.click()
            logging.info("Selecionado o máximo de itens por página: 50")
            return
        except Exception as e:
            attempts += 1
            logging.error(
                "Erro ao tentar selecionar o número máximo de itens por página (tentativa %s/%s): %s", attempts, max_attempts, e)
            time.sleep(2)

    logging.error(
        "Falha ao selecionar o número máximo de itens por página após várias tentativas.")
    driver.quit()
    raise ValueError(
        "Não foi possível selecionar o número máximo de itens por página.")


def download_pdf(pdf_urls: List[str], save_path: str, downloaded_files: List[Tuple[str, str]], failed_files: List[str]) -> None:
    """Faz o download do PDF e salva no caminho especificado."""
    for pdf_url in pdf_urls:
        try:
            response = requests.get(pdf_url, timeout=10)
            response.raise_for_status()
            with open(save_path, 'wb') as file:
                file.write(response.content)
            logging.info(
                "PDF baixado e salvo em: %s usando o link: %s", save_path, pdf_url)
            # Armazena o caminho e o link
            downloaded_files.append((save_path, pdf_url))
            return
        except requests.exceptions.HTTPError as http_err:
            logging.error(
                "Erro HTTP ao baixar o PDF: %s - Link tentado: %s", http_err, pdf_url)
        except Exception as e:
            logging.error("Erro ao baixar o PDF: %s", e)

    failed_files.append(pdf_urls[0])


def click_and_download_pdfs(driver: webdriver.Chrome, download_dir: str, bucket) -> List[dict]:
    """Encontra os artigos, extrai informações, faz o download dos PDFs, converte para CSV, faz upload para o Backblaze B2 e retorna os dados para publicação."""
    downloaded_files = []
    failed_files = []
    results_for_rabbitmq = []

    try:
        total_results = get_total_results(driver)
        if total_results == 0:
            logging.info("Nenhum documento disponível para download.")
            return results_for_rabbitmq

        select_max_items_per_page(driver)

        processed_results = 0

        while processed_results < total_results and processed_results < 50:
            articles = driver.find_elements(By.TAG_NAME, 'article')

            if not articles:
                logging.info("Nenhum artigo encontrado para processar.")
                break

            for article in articles:
                attempts = 0
                max_attempts = 2  # Número máximo de tentativas para lidar com stale element
                while attempts < max_attempts:
                    try:
                        # Extrai informações do artigo
                        article_url, publication_date, document_type, nome = extract_article_info(
                            article)
                        if not article_url:
                            failed_files.append(article_url)
                            break

                        # Converte link do artigo para o link do PDF
                        pdf_links = get_pdf_link(article_url)
                        if not pdf_links:
                            failed_files.append(article_url)
                            break

                        logging.info("Links de PDF gerados: %s", pdf_links)
                        pdf_filename = os.path.basename(pdf_links[0])
                        save_path = os.path.join(download_dir, pdf_filename)

                        driver.get(pdf_links[0])
                        time.sleep(2)

                        download_pdf(pdf_links, save_path,
                                     downloaded_files, failed_files)

                        # Converte PDF para CSV
                        csv_path = convert_pdf_to_csv(save_path)

                        # Realiza upload para o Backblaze B2
                        pdf_url = upload_to_backblaze(bucket, save_path)
                        csv_url = upload_to_backblaze(bucket, csv_path)

                        # Adiciona os dados para serem enviados ao RabbitMQ
                        document_data = {
                            'nome': nome,
                            'data': publication_date,
                            'tipo': document_type,
                            'link': article_url,
                            'pdf_path': pdf_url,
                            'csv_path': csv_url,
                            'filename': pdf_filename,
                        }
                        results_for_rabbitmq.append(document_data)

                        driver.back()
                        time.sleep(2)

                        processed_results += 1

                        if processed_results >= total_results or processed_results >= 50:
                            logging.info(
                                "Número máximo de resultados processados ou limite atingido.")
                            break
                        else:
                            break

                    except Exception as article_exception:
                        attempts += 1
                        logging.error(
                            "Erro ao processar artigo na tentativa %s: %s", attempts, article_exception)
                        time.sleep(2)

                        if "stale element reference" in str(article_exception).lower():
                            articles = driver.find_elements(
                                By.TAG_NAME, 'article')
                        else:
                            failed_files.append(article_url)
                            break

    except Exception as e:
        logging.error("Erro ao encontrar artigos: %s", e)

    retry_failed_downloads(failed_files, download_dir, downloaded_files)

    success_files = set(downloaded_files)
    logging.info("Total de arquivos baixados com sucesso: %s",
                 len(success_files))
    logging.info("Total de arquivos com falha no download: %s",
                 len(failed_files))
    logging.info("Arquivos baixados:")
    for file_path, pdf_link in downloaded_files:
        logging.info(f"{file_path}: {pdf_link}")
    logging.info("Arquivos que falharam:")
    for file in failed_files:
        logging.info(file)

    # limpa diretório de downloads
    for file_path, _ in success_files:
        os.remove(file_path)

    return results_for_rabbitmq
