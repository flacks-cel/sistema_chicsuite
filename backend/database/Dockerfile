FROM postgres:14.10-alpine

# Copiar script de inicialização
COPY init.sql /docker-entrypoint-initdb.d/

# Configure as permissões
RUN chmod 0755 /docker-entrypoint-initdb.d/init.sql

# Configurar variáveis de ambiente
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=flacks0102
ENV POSTGRES_DB=chicsuite

# Expor porta padrão do PostgreSQL
EXPOSE 5432