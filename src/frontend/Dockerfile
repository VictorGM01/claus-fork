# Etapa 1: Construção da aplicação
FROM node:18 AS builder

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar o arquivo package.json e package-lock.json para o container
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar todos os arquivos do projeto para o container
COPY . .

# Construir a aplicação para produção
RUN npm run build

# Etapa 2: Servir a aplicação
FROM node:18

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos gerados pela build para a nova etapa
COPY --from=builder /app/dist ./dist

# Instalar o servidor HTTP simples para servir a aplicação
RUN npm install -g serve

# Expor a porta 5173
EXPOSE 5173

# Comando para rodar a aplicação
CMD ["serve", "-s", "dist", "-l", "5173"]