const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rota para calcular total (deve vir antes das rotas com parâmetros)
router.post('/calcular-total', atendimentoController.calcularTotal);

// Rotas de busca por cliente e profissional
router.get('/cliente/:cliente_id', atendimentoController.buscarPorCliente);
router.get('/profissional/:profissional_id', atendimentoController.buscarPorProfissional);

// Rotas básicas de CRUD
router.get('/', atendimentoController.listar);
router.get('/:id', atendimentoController.buscarPorId);
router.post('/', atendimentoController.criar);
router.put('/:id', atendimentoController.atualizar);
router.delete('/:id', atendimentoController.excluir);

module.exports = router;