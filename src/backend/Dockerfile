# Usar uma imagem oficial do Node.js como base
FROM node:20

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar package.json e package-lock.json para o diretório de trabalho
COPY package.json ./
COPY package-lock.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código para o diretório de trabalho
COPY . .

# Expor a porta que o servidor Node.js estará ouvindo
EXPOSE 3000 3001
