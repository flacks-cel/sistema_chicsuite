FROM node:18-slim

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta do React
EXPOSE 3000

# Comando para iniciar em modo desenvolvimento
CMD ["npm", "start"]