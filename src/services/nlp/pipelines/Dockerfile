# Usar uma imagem oficial do Python como base
FROM python:3.10

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar o arquivo requirements.txt para o diretório de trabalho
COPY ../../requirements.txt .

# Instalar as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o código da pasta pipelines para o diretório de trabalho
COPY . .
