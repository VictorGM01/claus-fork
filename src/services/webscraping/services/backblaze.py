import logging
import os
from b2sdk.v2 import InMemoryAccountInfo, B2Api
from config.settings import B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME


def authenticate_b2():
    """Autentica com o Backblaze B2 e retorna o objeto B2Api e bucket."""
    info = InMemoryAccountInfo()
    b2_api = B2Api(info)

    try:
        b2_api.authorize_account(
            "production", B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY)
        logging.info("Autenticado com o Backblaze B2 com sucesso.")

        # Obter o bucket
        bucket = b2_api.get_bucket_by_name(B2_BUCKET_NAME)
        return b2_api, bucket
    except Exception as e:
        logging.error(f"Erro ao autenticar no Backblaze B2: {e}")
        return None, None


def upload_to_backblaze(bucket, file_path: str) -> str:
    """Faz upload de um arquivo para um bucket do Backblaze B2 e retorna a URL pública."""
    try:
        file_name = os.path.basename(file_path)
        # Upload do arquivo
        bucket.upload_local_file(local_file=file_path, file_name=file_name)
        logging.info(f"Arquivo '{file_name}' enviado para o bucket '{
                     B2_BUCKET_NAME}' com sucesso.")

        # Gerar URL pública
        file_url = f"https://f005.backblazeb2.com/file/{
            B2_BUCKET_NAME}/{file_name}"
        logging.info(f"URL pública do arquivo: {file_url}")
        return file_url
    except Exception as e:
        logging.error(f"Erro ao fazer upload para o Backblaze B2: {e}")
        return ""
