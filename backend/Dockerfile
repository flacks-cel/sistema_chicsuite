FROM node:18-slim

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Script de inicialização
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expor porta da aplicação
EXPOSE 3001

# Usar script de inicialização
ENTRYPOINT ["docker-entrypoint.sh"]