const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas de produtos
router.get('/', produtoController.listar);
router.get('/:id', produtoController.buscarPorId);
router.post('/', produtoController.criar);
router.put('/:id', produtoController.atualizar);
router.patch('/:id/estoque', produtoController.atualizarEstoque);
router.delete('/:id', produtoController.excluir);

module.exports = router;