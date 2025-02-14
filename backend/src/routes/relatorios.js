const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const relatorioController = require('../controllers/relatorioController');

// Aplicar middleware de autenticação
router.use(authMiddleware);

// Rota para relatório de comissões
router.get('/comissoes', relatorioController.getComissoesPorPeriodo);

module.exports = router;