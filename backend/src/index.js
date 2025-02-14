const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Configurações do Express
app.use(cors());
app.use(express.json());

// Conexão com o banco
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'flacks0102',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'chicsuite',
  port: process.env.DB_PORT || 5432,
});

// Teste de conexão com o banco
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
  } else {
    console.log('Conectado ao banco de dados');
  }
});

// Exportar pool para uso nos controllers
app.locals.pool = pool;

// Importar rotas
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const profissionaisRoutes = require('./routes/profissionais');
const produtosRoutes = require('./routes/produtos');
const promocoesRoutes = require('./routes/promocoes');
const atendimentosRoutes = require('./routes/atendimentos');
const dashboardRoutes = require('./routes/dashboard');
const usuariosRoutes = require('./routes/usuarios');
const configuracoesRoutes = require('./routes/configuracoes');
const relatoriosRouter = require('./routes/relatorios');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/profissionais', profissionaisRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/promocoes', promocoesRoutes);
app.use('/api/atendimentos', atendimentosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/configuracoes', configuracoesRoutes);
app.use('/api/relatorios', relatoriosRouter);

// Rota básica de teste
app.get('/', (req, res) => {
  res.json({ message: 'API ChicSuite está funcionando!' });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});