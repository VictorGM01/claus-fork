# Usa a imagem oficial do Node.js como base
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia o package.json e o package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instala as dependências do projeto (incluindo devDependencies para Nest)
RUN npm install

# Copia o restante dos arquivos da aplicação para o diretório de trabalho
COPY . .

# Compila o projeto NestJS
RUN npm run build

# Expõe a porta que o NestJS utiliza
EXPOSE 3004

# Comando para rodar a aplicação
CMD ["npm", "run", "start:prod"]
