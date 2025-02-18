const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');

router.get('/comissoes', relatorioController.getComissoesPorPeriodo);

module.exports = router;