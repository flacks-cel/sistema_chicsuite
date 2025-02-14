const pool = require('../database/connection');
const bcrypt = require('bcrypt');

const usuarioController = {
    // Listar todos os usuários
    async listar(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    u.*,
                    p.nome as profissional_nome,
                    p.especialidade as profissional_especialidade
                FROM usuarios u
                LEFT JOIN profissionais p ON p.id = u.profissional_id
                ORDER BY u.usuario
            `);

            // Remover a senha dos resultados
            const usuarios = result.rows.map(user => {
                const { senha, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });

            res.json(usuarios);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ message: 'Erro ao listar usuários' });
        }
    },

    // Buscar usuário por ID
    async buscarPorId(req, res) {
        const { id } = req.params;
        try {
            const result = await pool.query(`
                SELECT 
                    u.*,
                    p.nome as profissional_nome,
                    p.especialidade as profissional_especialidade
                FROM usuarios u
                LEFT JOIN profissionais p ON p.id = u.profissional_id
                WHERE u.id = $1
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            // Remover a senha do resultado
            const { senha, ...usuario } = result.rows[0];
            res.json(usuario);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ message: 'Erro ao buscar usuário' });
        }
    },

    // Criar novo usuário
    async criar(req, res) {
        const { profissional_id, usuario, senha, categoria } = req.body;
        
        try {
            // Verificar se usuário já existe
            const userExists = await pool.query(
                'SELECT id FROM usuarios WHERE usuario = $1',
                [usuario]
            );

            if (userExists.rows.length > 0) {
                return res.status(400).json({ message: 'Nome de usuário já existe' });
            }

            // Criptografar senha
            const hashSenha = await bcrypt.hash(senha, 10);

            // Criar usuário
            const result = await pool.query(
                `INSERT INTO usuarios (
                    profissional_id, 
                    usuario, 
                    senha, 
                    categoria, 
                    ativo
                ) VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [profissional_id, usuario, hashSenha, categoria, true]
            );

            // Remover a senha do resultado
            const { senha: _, ...novoUsuario } = result.rows[0];
            res.status(201).json(novoUsuario);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ message: 'Erro ao criar usuário' });
        }
    },

    // Atualizar usuário
    async atualizar(req, res) {
        const { id } = req.params;
        const { profissional_id, usuario, senha, categoria, ativo } = req.body;

        try {
            // Verificar se usuário existe
            const userExists = await pool.query(
                'SELECT id FROM usuarios WHERE usuario = $1 AND id != $2',
                [usuario, id]
            );

            if (userExists.rows.length > 0) {
                return res.status(400).json({ message: 'Nome de usuário já existe' });
            }

            let query = `
                UPDATE usuarios 
                SET 
                    profissional_id = $1,
                    usuario = $2,
                    categoria = $3,
                    ativo = $4
            `;
            let params = [profissional_id, usuario, categoria, ativo];

            // Se uma nova senha foi fornecida, atualizar senha
            if (senha) {
                const hashSenha = await bcrypt.hash(senha, 10);
                query += `, senha = $${params.length + 1}`;
                params.push(hashSenha);
            }

            query += ` WHERE id = $${params.length + 1} RETURNING *`;
            params.push(id);

            const result = await pool.query(query, params);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            // Remover a senha do resultado
            const { senha: _, ...usuarioAtualizado } = result.rows[0];
            res.json(usuarioAtualizado);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ message: 'Erro ao atualizar usuário' });
        }
    },

    // Alterar senha
    async alterarSenha(req, res) {
        const { id } = req.params;
        const { senha_atual, nova_senha } = req.body;

        try {
            // Buscar usuário
            const user = await pool.query(
                'SELECT * FROM usuarios WHERE id = $1',
                [id]
            );

            if (user.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            // Verificar senha atual
            const senhaValida = await bcrypt.compare(senha_atual, user.rows[0].senha);
            if (!senhaValida) {
                return res.status(401).json({ message: 'Senha atual incorreta' });
            }

            // Gerar hash da nova senha
            const hashSenha = await bcrypt.hash(nova_senha, 10);

            // Atualizar senha
            await pool.query(
                'UPDATE usuarios SET senha = $1 WHERE id = $2',
                [hashSenha, id]
            );

            res.json({ message: 'Senha alterada com sucesso' });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({ message: 'Erro ao alterar senha' });
        }
    },

    // Alternar status (ativar/desativar)
    async alternarStatus(req, res) {
        const { id } = req.params;

        try {
            // Verificar se é o único usuário admin ativo
            const user = await pool.query(
                'SELECT * FROM usuarios WHERE id = $1',
                [id]
            );

            if (user.rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            if (user.rows[0].categoria === 'admin' && user.rows[0].ativo) {
                const adminsAtivos = await pool.query(
                    'SELECT COUNT(*) as total FROM usuarios WHERE categoria = $1 AND ativo = true',
                    ['admin']
                );

                if (adminsAtivos.rows[0].total <= 1) {
                    return res.status(400).json({ 
                        message: 'Não é possível desativar o único usuário administrador' 
                    });
                }
            }

            // Alternar status
            const result = await pool.query(
                'UPDATE usuarios SET ativo = NOT ativo WHERE id = $1 RETURNING *',
                [id]
            );

            // Remover a senha do resultado
            const { senha, ...usuario } = result.rows[0];
            res.json(usuario);
        } catch (error) {
            console.error('Erro ao alternar status do usuário:', error);
            res.status(500).json({ message: 'Erro ao alternar status do usuário' });
        }
    }
};

module.exports = usuarioController;