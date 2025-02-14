const pool = require('../database/connection');

const clienteController = {
    // Listar todos os clientes
    async listar(req, res) {
        try {
            // Log para debug
            console.log('Usuário requisitando listagem:', req.usuarioId, req.usuarioCategoria);

            const result = await pool.query(
                'SELECT * FROM clientes ORDER BY nome'
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).json({ message: 'Erro ao listar clientes' });
        }
    },

    // Buscar cliente por ID
    async buscarPorId(req, res) {
        const { id } = req.params;
        try {
            const result = await pool.query(
                'SELECT * FROM clientes WHERE id = $1',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            res.status(500).json({ message: 'Erro ao buscar cliente' });
        }
    },

    // Criar novo cliente
    async criar(req, res) {
        const { nome, email, fone } = req.body;

        try {
            const result = await pool.query(
                'INSERT INTO clientes (nome, email, fone) VALUES ($1, $2, $3) RETURNING *',
                [nome, email, fone]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            if (error.code === '23505') { // código de erro de violação de unique
                res.status(400).json({ message: 'Email já cadastrado' });
            } else {
                res.status(500).json({ message: 'Erro ao criar cliente' });
            }
        }
    },

    // Atualizar cliente
    async atualizar(req, res) {
        const { id } = req.params;
        const { nome, email, fone } = req.body;

        try {
            const result = await pool.query(
                'UPDATE clientes SET nome = $1, email = $2, fone = $3 WHERE id = $4 RETURNING *',
                [nome, email, fone, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            if (error.code === '23505') {
                res.status(400).json({ message: 'Email já cadastrado' });
            } else {
                res.status(500).json({ message: 'Erro ao atualizar cliente' });
            }
        }
    },

    // Excluir cliente
    async excluir(req, res) {
        const { id } = req.params;

        try {
            // Verificar se o cliente tem atendimentos
            const atendimentos = await pool.query(
                'SELECT id FROM atendimentos WHERE cliente_id = $1 LIMIT 1',
                [id]
            );

            if (atendimentos.rows.length > 0) {
                return res.status(400).json({ 
                    message: 'Cliente não pode ser excluído pois possui atendimentos' 
                });
            }

            const result = await pool.query(
                'DELETE FROM clientes WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }

            res.json({ message: 'Cliente excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            res.status(500).json({ message: 'Erro ao excluir cliente' });
        }
    }
};

module.exports = clienteController;