const express = require('express');
const router = express.Router();
const configuracaoController = require('../controllers/configuracaoController');
const authMiddleware = require('../middleware/auth');

// Middleware para verificar se é admin
const adminMiddleware = (req, res, next) => {
    if (!req.usuarioCategoria || req.usuarioCategoria !== 'admin') {
        return res.status(403).json({
            message: 'Acesso não autorizado. Apenas administradores podem acessar este recurso.'
        });
    }
    next();
};

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(authMiddleware);
router.use(adminMiddleware);

// Rotas de configurações com logging
router.get('/', async (req, res, next) => {
    console.log('GET /configuracoes - Buscando configurações');
    await configuracaoController.buscar(req, res, next);
});

router.put('/', async (req, res, next) => {
    console.log('PUT /configuracoes - Atualizando configurações:', req.body);
    await configuracaoController.atualizar(req, res, next);
});

router.post('/testar-email', async (req, res, next) => {
    console.log('POST /configuracoes/testar-email - Testando configurações de email');
    await configuracaoController.testarEmail(req, res, next);
});

// Rotas de comissões com logging
router.get('/comissoes', async (req, res, next) => {
    console.log('GET /configuracoes/comissoes - Buscando comissões');
    await configuracaoController.buscarComissoes(req, res, next);
});

router.put('/comissoes/:profissional_id', async (req, res, next) => {
    console.log(`PUT /configuracoes/comissoes/${req.params.profissional_id} - Atualizando comissão:`, req.body);
    await configuracaoController.atualizarComissao(req, res, next);
});

module.exports = router;