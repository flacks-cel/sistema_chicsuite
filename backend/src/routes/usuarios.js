const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/auth');

// Middleware para verificar se é admin
const adminMiddleware = (req, res, next) => {
    if (req.usuarioCategoria !== 'admin') {
        return res.status(403).json({ 
            message: 'Acesso não autorizado. Apenas administradores podem acessar este recurso.' 
        });
    }
    next();
};

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas que requerem privilégios de admin
router.get('/', adminMiddleware, usuarioController.listar);
router.post('/', adminMiddleware, usuarioController.criar);
router.get('/:id', adminMiddleware, usuarioController.buscarPorId);
router.put('/:id', adminMiddleware, usuarioController.atualizar);
router.patch('/:id/status', adminMiddleware, usuarioController.alternarStatus);

// Rota para alterar própria senha (qualquer usuário pode alterar sua própria senha)
router.post('/:id/senha', (req, res, next) => {
    // Verificar se o usuário está tentando alterar sua própria senha
    if (req.usuarioId !== req.params.id && req.usuarioCategoria !== 'admin') {
        return res.status(403).json({ 
            message: 'Você só pode alterar sua própria senha' 
        });
    }
    next();
}, usuarioController.alterarSenha);

module.exports = router;