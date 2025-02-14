const express = require('express');
const router = express.Router();
const profissionalController = require('../controllers/profissionalController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas de profissionais
router.get('/', profissionalController.listar);
router.get('/:id', profissionalController.buscarPorId);
router.post('/', profissionalController.criar);
router.put('/:id', profissionalController.atualizar);
router.delete('/:id', profissionalController.excluir);

module.exports = router;