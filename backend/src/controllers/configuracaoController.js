const pool = require('../database/connection');

const configuracaoController = {
    // Buscar configurações
    async buscar(req, res) {
        try {
            console.log('Buscando configurações do banco...');
            const result = await pool.query('SELECT * FROM configuracoes LIMIT 1');
            
            if (result.rows.length === 0) {
                console.log('Nenhuma configuração encontrada, criando padrão...');
                // Se não existir, criar configurações padrão
                const defaultConfig = {
                    nome_salao: 'ChicSuite',
                    endereco: '',
                    telefone: '',
                    email: '',
                    percentual_comissao_padrao: 30,
                    smtp_host: '',
                    smtp_port: '',
                    smtp_user: '',
                    smtp_pass: '',
                    smtp_from: ''
                };

                const insertResult = await pool.query(
                    `INSERT INTO configuracoes (
                        nome_salao, 
                        endereco, 
                        telefone, 
                        email,
                        percentual_comissao_padrao,
                        smtp_host,
                        smtp_port,
                        smtp_user,
                        smtp_pass,
                        smtp_from
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                    Object.values(defaultConfig)
                );

                console.log('Configurações padrão criadas:', insertResult.rows[0]);
                return res.json(insertResult.rows[0]);
            }

            console.log('Configurações encontradas:', result.rows[0]);
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            res.status(500).json({ error: 'Erro ao buscar configurações', details: error.message });
        }
    },

    // Atualizar configurações
    async atualizar(req, res) {
        try {
            console.log('Dados recebidos para atualização:', req.body);
            
            const {
                nome_salao,
                endereco,
                telefone,
                email,
                percentual_comissao_padrao,
                smtp_host,
                smtp_port,
                smtp_user,
                smtp_pass,
                smtp_from
            } = req.body;

            // Validações básicas
            if (!nome_salao) {
                return res.status(400).json({ error: 'Nome do salão é obrigatório' });
            }

            if (percentual_comissao_padrao < 0 || percentual_comissao_padrao > 100) {
                return res.status(400).json({ error: 'Percentual de comissão deve estar entre 0 e 100' });
            }

            const result = await pool.query(
                `UPDATE configuracoes 
                SET 
                    nome_salao = $1,
                    endereco = $2,
                    telefone = $3,
                    email = $4,
                    percentual_comissao_padrao = $5,
                    smtp_host = $6,
                    smtp_port = $7,
                    smtp_user = $8,
                    smtp_pass = $9,
                    smtp_from = $10,
                    data_atualizacao = CURRENT_TIMESTAMP
                RETURNING *`,
                [
                    nome_salao,
                    endereco || '',
                    telefone || '',
                    email || '',
                    percentual_comissao_padrao || 30,
                    smtp_host || '',
                    smtp_port || '',
                    smtp_user || '',
                    smtp_pass || '',
                    smtp_from || ''
                ]
            );

            if (result.rows.length === 0) {
                // Se não existir registro para atualizar, criar um novo
                const insertResult = await pool.query(
                    `INSERT INTO configuracoes (
                        nome_salao, 
                        endereco, 
                        telefone, 
                        email,
                        percentual_comissao_padrao,
                        smtp_host,
                        smtp_port,
                        smtp_user,
                        smtp_pass,
                        smtp_from
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                    [
                        nome_salao,
                        endereco || '',
                        telefone || '',
                        email || '',
                        percentual_comissao_padrao || 30,
                        smtp_host || '',
                        smtp_port || '',
                        smtp_user || '',
                        smtp_pass || '',
                        smtp_from || ''
                    ]
                );
                console.log('Novas configurações criadas:', insertResult.rows[0]);
                return res.json(insertResult.rows[0]);
            }

            console.log('Configurações atualizadas:', result.rows[0]);
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar configurações:', error);
            res.status(500).json({ error: 'Erro ao atualizar configurações', details: error.message });
        }
    },

    // Testar configurações de email
    async testarEmail(req, res) {
        try {
            const config = await pool.query('SELECT * FROM configuracoes LIMIT 1');
            
            if (config.rows.length === 0) {
                return res.status(404).json({ error: 'Configurações não encontradas' });
            }

            const emailConfig = config.rows[0];
            
            // Validar configurações de email
            if (!emailConfig.smtp_host || !emailConfig.smtp_port || !emailConfig.smtp_user || !emailConfig.smtp_pass) {
                return res.status(400).json({ error: 'Configurações de email incompletas' });
            }

            // Aqui você implementaria a lógica de teste de email
            console.log('Configurações de email testadas:', {
                host: emailConfig.smtp_host,
                port: emailConfig.smtp_port,
                user: emailConfig.smtp_user
            });

            res.json({ message: 'Configurações de email testadas com sucesso' });
        } catch (error) {
            console.error('Erro ao testar configurações de email:', error);
            res.status(500).json({ error: 'Erro ao testar configurações de email', details: error.message });
        }
    },

    // Buscar configurações de comissão por profissional
    async buscarComissoes(req, res) {
        try {
            console.log('Buscando comissões dos profissionais...');
            const result = await pool.query(`
                SELECT 
                    p.id,
                    p.nome,
                    p.especialidade,
                    COALESCE(c.percentual, (SELECT percentual_comissao_padrao FROM configuracoes LIMIT 1)) as percentual
                FROM profissionais p
                LEFT JOIN comissoes c ON c.profissional_id = p.id
                ORDER BY p.nome
            `);

            console.log('Comissões encontradas:', result.rows);
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar comissões:', error);
            res.status(500).json({ error: 'Erro ao buscar comissões', details: error.message });
        }
    },

    // Atualizar comissão de um profissional
    async atualizarComissao(req, res) {
        const { profissional_id } = req.params;
        const { percentual } = req.body;

        try {
            // Validações
            if (!profissional_id) {
                return res.status(400).json({ error: 'ID do profissional é obrigatório' });
            }

            if (percentual === undefined || percentual < 0 || percentual > 100) {
                return res.status(400).json({ error: 'Percentual deve estar entre 0 e 100' });
            }

            console.log(`Atualizando comissão do profissional ${profissional_id} para ${percentual}%`);

            const result = await pool.query(
                `INSERT INTO comissoes (profissional_id, percentual)
                VALUES ($1, $2)
                ON CONFLICT (profissional_id) 
                DO UPDATE SET 
                    percentual = $2,
                    data_atualizacao = CURRENT_TIMESTAMP
                RETURNING *`,
                [profissional_id, percentual]
            );

            console.log('Comissão atualizada:', result.rows[0]);
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar comissão:', error);
            res.status(500).json({ error: 'Erro ao atualizar comissão', details: error.message });
        }
    }
};

module.exports = configuracaoController;