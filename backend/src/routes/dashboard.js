const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação
router.use(authMiddleware);

// Rota para obter dados do dashboard
router.get('/', dashboardController.getDashboardData);

module.exports = router;