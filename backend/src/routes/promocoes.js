const express = require('express');
const router = express.Router();
const promocaoController = require('../controllers/promocaoController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas de promoções
router.get('/', promocaoController.listar);
router.get('/ativas', promocaoController.listarAtivas);
router.get('/:id', promocaoController.buscarPorId);
router.post('/', promocaoController.criar);
router.put('/:id', promocaoController.atualizar);
router.delete('/:id', promocaoController.excluir);

module.exports = router;