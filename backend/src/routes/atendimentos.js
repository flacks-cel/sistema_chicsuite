const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas de atendimentos
router.get('/', atendimentoController.listar);
router.get('/:id', atendimentoController.buscarPorId);
router.post('/', atendimentoController.criar);
router.post('/calcular-total', atendimentoController.calcularTotal);
router.get('/cliente/:cliente_id', atendimentoController.buscarPorCliente);
router.get('/profissional/:profissional_id', atendimentoController.buscarPorProfissional);

module.exports = router;