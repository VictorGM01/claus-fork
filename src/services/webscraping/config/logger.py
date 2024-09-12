import logging


def configure_logger():
    """Configura o logger para o projeto."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )


# Chamada para configurar o logger
configure_logger()
