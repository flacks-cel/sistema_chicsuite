#!/bin/sh

# Esperar o PostgreSQL inicializar
echo "Aguardando PostgreSQL..."
sleep 10

# Criar usuário admin
echo "Criando usuário admin..."
node src/scripts/createAdmin.js

# Iniciar a aplicação
echo "Iniciando a aplicação..."
npm start