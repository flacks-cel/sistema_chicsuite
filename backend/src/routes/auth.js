const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    console.log('Recebida requisição de login:', req.body);
    
    const { usuario, senha } = req.body;
    const pool = req.app.locals.pool;
    
    try {
        // Buscar usuário
        const query = 'SELECT u.*, p.nome as nome_profissional FROM usuarios u LEFT JOIN profissionais p ON u.profissional_id = p.id WHERE u.usuario = $1';
        console.log('Executando query:', query);
        console.log('Com parâmetros:', [usuario]);

        const result = await pool.query(query, [usuario]);
        console.log('Resultado da consulta:', result.rows);

        if (result.rows.length === 0) {
            console.log('Usuário não encontrado');
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        const user = result.rows[0];
        console.log('Usuário encontrado:', { ...user, senha: '[PROTEGIDA]' });

        // Verificar senha
        console.log('Senha recebida (hash):', await bcrypt.hash(senha, 10));
        console.log('Senha armazenada:', user.senha);
        
        const validPassword = await bcrypt.compare(senha, user.senha);
        console.log('Senha válida?', validPassword);

        if (!validPassword) {
            console.log('Senha inválida');
            return res.status(401).json({ message: 'Usuário ou senha inválidos' });
        }

        if (!user.ativo) {
            console.log('Usuário inativo');
            return res.status(401).json({ message: 'Usuário inativo' });
        }

        // Gerar token
        const tokenPayload = { 
            id: user.id,
            categoria: user.categoria,
            nome: user.nome_profissional
        };
        console.log('Gerando token com payload:', tokenPayload);

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || 'suachavesecretaaqui123',
            { expiresIn: '8h' }
        );

        const response = {
            token,
            categoria: user.categoria,
            nome: user.nome_profissional
        };
        console.log('Enviando resposta:', { ...response, token: '[PROTEGIDO]' });

        res.json(response);
        
    } catch (error) {
        console.error('Erro detalhado no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;