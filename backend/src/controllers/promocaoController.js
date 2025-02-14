const pool = require('../database/connection');

const promocaoController = {
    // Listar todas as promoções
    async listar(req, res) {
        try {
            const result = await pool.query(`
                SELECT *,
                    CASE 
                        WHEN current_date BETWEEN data_inicio AND data_fim THEN true 
                        ELSE false 
                    END as ativa
                FROM promocoes 
                ORDER BY data_inicio DESC
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao listar promoções:', error);
            res.status(500).json({ message: 'Erro ao listar promoções' });
        }
    },

    // Buscar promoção por ID
    async buscarPorId(req, res) {
        const { id } = req.params;
        try {
            const result = await pool.query(
                'SELECT * FROM promocoes WHERE id = $1',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Promoção não encontrada' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar promoção:', error);
            res.status(500).json({ message: 'Erro ao buscar promoção' });
        }
    },

    // Buscar promoções ativas
    async listarAtivas(req, res) {
        try {
            const result = await pool.query(`
                SELECT *
                FROM promocoes
                WHERE current_date BETWEEN data_inicio AND data_fim
                ORDER BY data_inicio DESC
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao listar promoções ativas:', error);
            res.status(500).json({ message: 'Erro ao listar promoções ativas' });
        }
    },

    // Criar nova promoção
    async criar(req, res) {
        const { titulo, descricao, percentual_desconto, data_inicio, data_fim } = req.body;

        try {
            // Validar datas
            if (new Date(data_fim) <= new Date(data_inicio)) {
                return res.status(400).json({ 
                    message: 'A data final deve ser posterior à data inicial' 
                });
            }

            // Validar percentual de desconto
            if (percentual_desconto <= 0 || percentual_desconto > 100) {
                return res.status(400).json({ 
                    message: 'O percentual de desconto deve estar entre 0 e 100' 
                });
            }

            const result = await pool.query(
                'INSERT INTO promocoes (titulo, descricao, percentual_desconto, data_inicio, data_fim) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [titulo, descricao, percentual_desconto, data_inicio, data_fim]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao criar promoção:', error);
            res.status(500).json({ message: 'Erro ao criar promoção' });
        }
    },

    // Atualizar promoção
    async atualizar(req, res) {
        const { id } = req.params;
        const { titulo, descricao, percentual_desconto, data_inicio, data_fim } = req.body;

        try {
            // Validar datas
            if (new Date(data_fim) <= new Date(data_inicio)) {
                return res.status(400).json({ 
                    message: 'A data final deve ser posterior à data inicial' 
                });
            }

            // Validar percentual de desconto
            if (percentual_desconto <= 0 || percentual_desconto > 100) {
                return res.status(400).json({ 
                    message: 'O percentual de desconto deve estar entre 0 e 100' 
                });
            }

            const result = await pool.query(
                'UPDATE promocoes SET titulo = $1, descricao = $2, percentual_desconto = $3, data_inicio = $4, data_fim = $5 WHERE id = $6 RETURNING *',
                [titulo, descricao, percentual_desconto, data_inicio, data_fim, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Promoção não encontrada' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar promoção:', error);
            res.status(500).json({ message: 'Erro ao atualizar promoção' });
        }
    },

    // Excluir promoção
    async excluir(req, res) {
        const { id } = req.params;

        try {
            // Verificar se a promoção está sendo usada em algum atendimento
            const atendimentos = await pool.query(
                'SELECT id FROM atendimentos WHERE promocao_id = $1 LIMIT 1',
                [id]
            );

            if (atendimentos.rows.length > 0) {
                return res.status(400).json({ 
                    message: 'Promoção não pode ser excluída pois está vinculada a atendimentos' 
                });
            }

            const result = await pool.query(
                'DELETE FROM promocoes WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Promoção não encontrada' });
            }

            res.json({ message: 'Promoção excluída com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir promoção:', error);
            res.status(500).json({ message: 'Erro ao excluir promoção' });
        }
    }
};

module.exports = promocaoController;