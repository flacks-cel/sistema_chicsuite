const pool = require('../database/connection');

const atendimentoController = {
    // Listar atendimentos
    async listar(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    a.*,
                    c.nome as cliente_nome,
                    p.nome as profissional_nome,
                    u.usuario as usuario_nome
                FROM atendimentos a
                LEFT JOIN clientes c ON c.id = a.cliente_id
                LEFT JOIN profissionais p ON p.id = a.profissional_id
                LEFT JOIN usuarios u ON u.id = a.usuario_criacao
                ORDER BY a.data_atendimento DESC
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao listar atendimentos:', error);
            res.status(500).json({ error: 'Erro ao listar atendimentos' });
        }
    },

    // Buscar atendimento por ID
    async buscarPorId(req, res) {
        const { id } = req.params;

        try {
            // Buscar atendimento
            const atendimentoResult = await pool.query(`
                SELECT 
                    a.*,
                    c.nome as cliente_nome,
                    p.nome as profissional_nome,
                    u.usuario as usuario_nome
                FROM atendimentos a
                LEFT JOIN clientes c ON c.id = a.cliente_id
                LEFT JOIN profissionais p ON p.id = a.profissional_id
                LEFT JOIN usuarios u ON u.id = a.usuario_criacao
                WHERE a.id = $1
            `, [id]);

            if (atendimentoResult.rows.length === 0) {
                return res.status(404).json({ error: 'Atendimento não encontrado' });
            }

            // Buscar produtos do atendimento
            const produtosResult = await pool.query(`
                SELECT 
                    ap.*,
                    p.nome as produto_nome
                FROM atendimento_produtos ap
                JOIN produtos p ON p.id = ap.produto_id
                WHERE ap.atendimento_id = $1
            `, [id]);

            const atendimento = atendimentoResult.rows[0];
            atendimento.produtos = produtosResult.rows;

            res.json(atendimento);
        } catch (error) {
            console.error('Erro ao buscar atendimento:', error);
            res.status(500).json({ error: 'Erro ao buscar atendimento' });
        }
    },

    // Criar atendimento
    async criar(req, res) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { cliente_id, profissional_id, servico, preco, forma_pagamento, produtos } = req.body;

            console.log('Criando atendimento:', {
                cliente_id,
                profissional_id,
                servico,
                preco,
                forma_pagamento,
                produtos
            });

            // Validações básicas
            if (!cliente_id || !profissional_id || !servico || !preco || !forma_pagamento) {
                throw new Error('Dados incompletos para criar atendimento');
            }

            // Criar o atendimento
            const atendimentoResult = await client.query(
                `INSERT INTO atendimentos 
                    (cliente_id, profissional_id, servico, preco, forma_pagamento, usuario_criacao)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [cliente_id, profissional_id, servico, preco, forma_pagamento, req.usuarioId]
            );

            const atendimento = atendimentoResult.rows[0];

            // Se houver produtos, buscar preço de custo e inserir
            if (produtos && produtos.length > 0) {
                for (const produto of produtos) {
                    // Validar dados do produto
                    if (!produto.produto_id || !produto.quantidade || !produto.preco_unitario) {
                        throw new Error('Dados de produto incompletos');
                    }

                    // Buscar o preço de custo do produto
                    const produtoResult = await client.query(
                        'SELECT preco_custo FROM produtos WHERE id = $1',
                        [produto.produto_id]
                    );

                    if (produtoResult.rows.length === 0) {
                        throw new Error(`Produto ${produto.produto_id} não encontrado`);
                    }

                    const preco_custo = produtoResult.rows[0].preco_custo;

                    // Inserir produto do atendimento com preço de custo
                    await client.query(
                        `INSERT INTO atendimento_produtos 
                            (atendimento_id, produto_id, quantidade, preco_unitario, preco_custo)
                        VALUES ($1, $2, $3, $4, $5)`,
                        [
                            atendimento.id,
                            produto.produto_id,
                            produto.quantidade,
                            produto.preco_unitario,
                            preco_custo
                        ]
                    );

                    // Atualizar estoque
                    await client.query(
                        'UPDATE produtos SET estoque = estoque - $1 WHERE id = $2',
                        [produto.quantidade, produto.produto_id]
                    );
                }
            }

            await client.query('COMMIT');
            
            // Buscar atendimento completo para retornar
            const atendimentoCompleto = await client.query(`
                SELECT 
                    a.*,
                    c.nome as cliente_nome,
                    p.nome as profissional_nome,
                    u.usuario as usuario_nome
                FROM atendimentos a
                LEFT JOIN clientes c ON c.id = a.cliente_id
                LEFT JOIN profissionais p ON p.id = a.profissional_id
                LEFT JOIN usuarios u ON u.id = a.usuario_criacao
                WHERE a.id = $1
            `, [atendimento.id]);

            res.status(201).json(atendimentoCompleto.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao criar atendimento:', error);
            res.status(500).json({ 
                error: 'Erro ao criar atendimento',
                details: error.message 
            });
        } finally {
            client.release();
        }
    },

    // Atualizar atendimento
    async atualizar(req, res) {
        const { id } = req.params;
        const { cliente_id, profissional_id, servico, preco, forma_pagamento } = req.body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `UPDATE atendimentos 
                SET 
                    cliente_id = $1,
                    profissional_id = $2,
                    servico = $3,
                    preco = $4,
                    forma_pagamento = $5
                WHERE id = $6
                RETURNING *`,
                [cliente_id, profissional_id, servico, preco, forma_pagamento, id]
            );

            if (result.rows.length === 0) {
                throw new Error('Atendimento não encontrado');
            }

            await client.query('COMMIT');
            res.json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao atualizar atendimento:', error);
            res.status(500).json({ error: 'Erro ao atualizar atendimento' });
        } finally {
            client.release();
        }
    },

    // Excluir atendimento
    async excluir(req, res) {
        const { id } = req.params;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Primeiro, recuperar os produtos do atendimento para devolver ao estoque
            const produtosResult = await client.query(
                'SELECT produto_id, quantidade FROM atendimento_produtos WHERE atendimento_id = $1',
                [id]
            );

            // Devolver produtos ao estoque
            for (const produto of produtosResult.rows) {
                await client.query(
                    'UPDATE produtos SET estoque = estoque + $1 WHERE id = $2',
                    [produto.quantidade, produto.produto_id]
                );
            }

            // Excluir produtos do atendimento
            await client.query('DELETE FROM atendimento_produtos WHERE atendimento_id = $1', [id]);

            // Excluir o atendimento
            const result = await client.query('DELETE FROM atendimentos WHERE id = $1 RETURNING *', [id]);

            if (result.rows.length === 0) {
                throw new Error('Atendimento não encontrado');
            }

            await client.query('COMMIT');
            res.json({ message: 'Atendimento excluído com sucesso' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao excluir atendimento:', error);
            res.status(500).json({ error: 'Erro ao excluir atendimento' });
        } finally {
            client.release();
        }
    },

    // Calcular total do atendimento
    async calcularTotal(req, res) {
        try {
            const { servico, produtos } = req.body;
            let total = servico?.preco || 0;

            if (produtos && produtos.length > 0) {
                const produtosTotal = produtos.reduce((acc, produto) => {
                    return acc + (produto.quantidade * produto.preco_unitario);
                }, 0);
                total += produtosTotal;
            }

            res.json({ total });
        } catch (error) {
            console.error('Erro ao calcular total:', error);
            res.status(500).json({ error: 'Erro ao calcular total' });
        }
    },

    // Buscar atendimentos por cliente
    async buscarPorCliente(req, res) {
        const { cliente_id } = req.params;
        try {
            const result = await pool.query(`
                SELECT 
                    a.*,
                    c.nome as cliente_nome,
                    p.nome as profissional_nome,
                    u.usuario as usuario_nome
                FROM atendimentos a
                LEFT JOIN clientes c ON c.id = a.cliente_id
                LEFT JOIN profissionais p ON p.id = a.profissional_id
                LEFT JOIN usuarios u ON u.id = a.usuario_criacao
                WHERE a.cliente_id = $1
                ORDER BY a.data_atendimento DESC
            `, [cliente_id]);

            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar atendimentos do cliente:', error);
            res.status(500).json({ error: 'Erro ao buscar atendimentos do cliente' });
        }
    },

    // Buscar atendimentos por profissional
    async buscarPorProfissional(req, res) {
        const { profissional_id } = req.params;
        try {
            const result = await pool.query(`
                SELECT 
                    a.*,
                    c.nome as cliente_nome,
                    p.nome as profissional_nome,
                    u.usuario as usuario_nome
                FROM atendimentos a
                LEFT JOIN clientes c ON c.id = a.cliente_id
                LEFT JOIN profissionais p ON p.id = a.profissional_id
                LEFT JOIN usuarios u ON u.id = a.usuario_criacao
                WHERE a.profissional_id = $1
                ORDER BY a.data_atendimento DESC
            `, [profissional_id]);

            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar atendimentos do profissional:', error);
            res.status(500).json({ error: 'Erro ao buscar atendimentos do profissional' });
        }
    }
};

module.exports = atendimentoController;