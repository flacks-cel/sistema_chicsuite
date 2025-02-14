const { Pool } = require('pg');

const config = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'flacks0102',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'chicsuite',
  port: process.env.DB_PORT || 5432,
};

console.log('Tentando conectar ao banco de dados com as configurações:', {
  user: config.user,
  host: config.host,
  database: config.database,
  port: config.port,
  password: '[PROTEGIDA]'
});

const pool = new Pool({
  ...config,
  // Adicionar algumas configs extras para melhor diagnóstico
  connectionTimeoutMillis: 5000,
  query_timeout: 10000
});

// Listener para erros de conexão
pool.on('error', (err) => {
  console.error('Erro inesperado no pool do banco:', err);
});

// Testar conexão inicial
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Conseguiu obter uma conexão do pool');
    
    const result = await client.query('SELECT NOW()');
    console.log('Query de teste executada com sucesso:', result.rows[0]);
    
    client.release();
    console.log('Conexão liberada de volta para o pool');
  } catch (err) {
    console.error('Erro durante o teste de conexão:', err);
    console.error('Detalhes adicionais:', {
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      hostname: err.hostname
    });
  }
}

testConnection();

module.exports = pool;