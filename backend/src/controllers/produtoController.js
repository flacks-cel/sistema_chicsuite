const pool = require('../database/connection');

const produtoController = {
    // Listar todos os produtos
    async listar(req, res) {
        try {
            const result = await pool.query(
                'SELECT * FROM produtos ORDER BY nome'
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            res.status(500).json({ message: 'Erro ao listar produtos' });
        }
    },

    // Buscar produto por ID
    async buscarPorId(req, res) {
        const { id } = req.params;
        try {
            const result = await pool.query(
                'SELECT * FROM produtos WHERE id = $1',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            res.status(500).json({ message: 'Erro ao buscar produto' });
        }
    },

    // Criar novo produto
    async criar(req, res) {
        const { nome, descricao, estoque, preco } = req.body;

        try {
            const result = await pool.query(
                'INSERT INTO produtos (nome, descricao, estoque, preco) VALUES ($1, $2, $3, $4) RETURNING *',
                [nome, descricao, estoque, preco]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            res.status(500).json({ message: 'Erro ao criar produto' });
        }
    },

    // Atualizar produto
    async atualizar(req, res) {
        const { id } = req.params;
        const { nome, descricao, estoque, preco } = req.body;

        try {
            const result = await pool.query(
                'UPDATE produtos SET nome = $1, descricao = $2, estoque = $3, preco = $4 WHERE id = $5 RETURNING *',
                [nome, descricao, estoque, preco, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            res.status(500).json({ message: 'Erro ao atualizar produto' });
        }
    },

    // Atualizar estoque
    async atualizarEstoque(req, res) {
        const { id } = req.params;
        const { quantidade } = req.body;

        try {
            const result = await pool.query(
                'UPDATE produtos SET estoque = estoque + $1 WHERE id = $2 RETURNING *',
                [quantidade, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar estoque:', error);
            res.status(500).json({ message: 'Erro ao atualizar estoque' });
        }
    },

    // Excluir produto
    async excluir(req, res) {
        const { id } = req.params;

        try {
            // Verificar se o produto está em algum atendimento
            const atendimentos = await pool.query(
                'SELECT id FROM atendimento_produtos WHERE produto_id = $1 LIMIT 1',
                [id]
            );

            if (atendimentos.rows.length > 0) {
                return res.status(400).json({ 
                    message: 'Produto não pode ser excluído pois está vinculado a atendimentos' 
                });
            }

            const result = await pool.query(
                'DELETE FROM produtos WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Produto não encontrado' });
            }

            res.json({ message: 'Produto excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            res.status(500).json({ message: 'Erro ao excluir produto' });
        }
    }
};

module.exports = produtoController;