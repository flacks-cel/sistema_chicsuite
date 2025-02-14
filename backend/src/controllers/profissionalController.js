const pool = require('../database/connection');

const profissionalController = {
    // Listar todos os profissionais
    async listar(req, res) {
        try {
            const result = await pool.query(`
                SELECT p.*, 
                       COALESCE(u.ativo, true) as usuario_ativo,
                       u.categoria as usuario_categoria
                FROM profissionais p
                LEFT JOIN usuarios u ON u.profissional_id = p.id
                ORDER BY p.nome
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao listar profissionais:', error);
            res.status(500).json({ message: 'Erro ao listar profissionais' });
        }
    },

    // Buscar profissional por ID
    async buscarPorId(req, res) {
        const { id } = req.params;
        try {
            const result = await pool.query(`
                SELECT p.*, 
                       COALESCE(u.ativo, true) as usuario_ativo,
                       u.categoria as usuario_categoria
                FROM profissionais p
                LEFT JOIN usuarios u ON u.profissional_id = p.id
                WHERE p.id = $1
            `, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar profissional:', error);
            res.status(500).json({ message: 'Erro ao buscar profissional' });
        }
    },

    // Criar novo profissional
    async criar(req, res) {
        const { nome, especialidade, email, fone } = req.body;

        try {
            const result = await pool.query(
                'INSERT INTO profissionais (nome, especialidade, email, fone) VALUES ($1, $2, $3, $4) RETURNING *',
                [nome, especialidade, email, fone]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao criar profissional:', error);
            if (error.code === '23505') {
                res.status(400).json({ message: 'Email já cadastrado' });
            } else {
                res.status(500).json({ message: 'Erro ao criar profissional' });
            }
        }
    },

    // Atualizar profissional
    async atualizar(req, res) {
        const { id } = req.params;
        const { nome, especialidade, email, fone } = req.body;

        try {
            const result = await pool.query(
                'UPDATE profissionais SET nome = $1, especialidade = $2, email = $3, fone = $4 WHERE id = $4 RETURNING *',
                [nome, especialidade, email, fone, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar profissional:', error);
            if (error.code === '23505') {
                res.status(400).json({ message: 'Email já cadastrado' });
            } else {
                res.status(500).json({ message: 'Erro ao atualizar profissional' });
            }
        }
    },

    // Excluir profissional
    async excluir(req, res) {
        const { id } = req.params;

        try {
            // Verificar se o profissional tem atendimentos
            const atendimentos = await pool.query(
                'SELECT id FROM atendimentos WHERE profissional_id = $1 LIMIT 1',
                [id]
            );

            if (atendimentos.rows.length > 0) {
                return res.status(400).json({ 
                    message: 'Profissional não pode ser excluído pois possui atendimentos' 
                });
            }

            // Verificar se o profissional tem usuário vinculado
            const usuario = await pool.query(
                'SELECT id FROM usuarios WHERE profissional_id = $1 LIMIT 1',
                [id]
            );

            if (usuario.rows.length > 0) {
                return res.status(400).json({ 
                    message: 'Profissional não pode ser excluído pois possui usuário vinculado' 
                });
            }

            const result = await pool.query(
                'DELETE FROM profissionais WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Profissional não encontrado' });
            }

            res.json({ message: 'Profissional excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir profissional:', error);
            res.status(500).json({ message: 'Erro ao excluir profissional' });
        }
    }
};

module.exports = profissionalController;