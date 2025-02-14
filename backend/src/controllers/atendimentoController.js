const pool = require('../database/connection');

const atendimentoController = {
    // Listar todos os atendimentos
    async listar(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    a.*,
                    c.nome as cliente_nome,
                    p.nome as profissional_nome,
                    pr.titulo as promocao_titulo,
                    pr.percentual_desconto as promocao_desconto,
                    u.usuario as usuario_criacao_nome
                FROM atendimentos a
                LEFT JOIN clientes c ON a.cliente_id = c.id
                LEFT JOIN profissionais p ON a.profissional_id = p.id
                LEFT JOIN promocoes pr ON a.promocao_id = pr.id
                LEFT JOIN usuarios u ON a.usuario_criacao = u.id
                ORDER BY a.data_atendimento DESC
            `);

            // Buscar produtos de cada atendimento
            for (let atendimento of result.rows) {
                const produtosResult = await pool.query(`
                    SELECT 
                        ap.*,
                        p.nome as produto_nome
                    FROM atendimento_produtos ap
                    JOIN produtos p ON ap.produto_id = p.id
                    WHERE ap.atendimento_id = $1
                `, [atendimento.id]);
                
                atendimento.produtos = produtosResult.rows;
            }

            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao listar atendimentos:', error);
            res.status(500).json({ message: 'Erro ao listar atendimentos' });
        }
    },

    // Buscar atendimento por ID
    async buscarPorId(req, res) {
        const { id } = req.params;
        try {
            const result = await pool.query(`
                SELECT 
                    a.*,
                    c.nome as cliente_nome,
                    p.nome as profissional_nome,
                    pr.titulo as promocao_titulo,
                    pr.percentual_desconto as promocao_desconto,
                    u.usuario as usuario_criacao_nome
                FROM atendimentos a
                LEFT JOIN clientes c ON a.cliente_id = c.id
                LEFT JOIN profissionais p ON a.profissional_id = p.id
                LEFT JOIN promocoes pr ON a.promocao_id = pr.id
                LEFT JOIN usuarios u ON a.usuario_criacao = u.id
                WHERE a.id = $1
            `, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Atendimento não encontrado' });
            }

            const atendimento = result.rows[0];

            // Buscar produtos do atendimento
            const produtosResult = await pool.query(`
                SELECT 
                    ap.*,
                    p.nome as produto_nome
                FROM atendimento_produtos ap
                JOIN produtos p ON ap.produto_id = p.id
                WHERE ap.atendimento_id = $1
            `, [id]);

            atendimento.produtos = produtosResult.rows;

            res.json(atendimento);
        } catch (error) {
            console.error('Erro ao buscar atendimento:', error);
            res.status(500).json({ message: 'Erro ao buscar atendimento' });
        }
    },

    // Criar novo atendimento
    async criar(req, res) {
        const { 
            cliente_id, 
            profissional_id, 
            promocao_id, 
            servico, 
            preco, 
            forma_pagamento,
            produtos 
        } = req.body;

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Criar atendimento
            const atendimentoResult = await client.query(
                `INSERT INTO atendimentos (
                    cliente_id, 
                    profissional_id, 
                    promocao_id, 
                    servico, 
                    preco, 
                    forma_pagamento,
                    usuario_criacao
                ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *`,
                [
                    cliente_id, 
                    profissional_id, 
                    promocao_id, 
                    servico, 
                    preco, 
                    forma_pagamento,
                    req.usuarioId
                ]
            );

            const atendimento = atendimentoResult.rows[0];

            // Adicionar produtos ao atendimento
            if (produtos && produtos.length > 0) {
                for (const produto of produtos) {
                    // Verificar estoque
                    const estoqueResult = await client.query(
                        'SELECT estoque FROM produtos WHERE id = $1',
                        [produto.produto_id]
                    );

                    if (estoqueResult.rows[0].estoque < produto.quantidade) {
                        throw new Error(`Estoque insuficiente para o produto ${produto.produto_id}`);
                    }

                    // Adicionar produto ao atendimento
                    await client.query(
                        `INSERT INTO atendimento_produtos (
                            atendimento_id, 
                            produto_id, 
                            quantidade, 
                            preco_unitario
                        ) VALUES ($1, $2, $3, $4)`,
                        [
                            atendimento.id, 
                            produto.produto_id, 
                            produto.quantidade, 
                            produto.preco_unitario
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

            // Buscar atendimento completo
            const result = await pool.query(`
                SELECT 
                    a.*,
                    c.nome as cliente_nome,
                    p.nome as profissional_nome,
                    pr.titulo as promocao_titulo,
                    pr.percentual_desconto as promocao_desconto,
                    u.usuario as usuario_criacao_nome
                FROM atendimentos a
                LEFT JOIN clientes c ON a.cliente_id = c.id
                LEFT JOIN profissionais p ON a.profissional_id = p.id
                LEFT JOIN promocoes pr ON a.promocao_id = pr.id
                LEFT JOIN usuarios u ON a.usuario_criacao = u.id
                WHERE a.id = $1
            `, [atendimento.id]);

            const atendimentoCompleto = result.rows[0];

            // Buscar produtos do atendimento
            const produtosResult = await pool.query(`
                SELECT 
                    ap.*,
                    p.nome as produto_nome
                FROM atendimento_produtos ap
                JOIN produtos p ON ap.produto_id = p.id
                WHERE ap.atendimento_id = $1
            `, [atendimento.id]);

            atendimentoCompleto.produtos = produtosResult.rows;

            res.status(201).json(atendimentoCompleto);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao criar atendimento:', error);
            res.status(500).json({ 
                message: error.message || 'Erro ao criar atendimento' 
            });
        } finally {
            client.release();
        }
    },

    // Calcular total do atendimento
    async calcularTotal(req, res) {
        const { servico, produtos, promocao_id } = req.body;
        
        try {
            // Valor do serviço
            let valorServico = parseFloat(servico.preco) || 0;

            // Valor dos produtos
            let valorProdutos = 0;
            if (produtos && produtos.length > 0) {
                valorProdutos = produtos.reduce((total, produto) => {
                    return total + (parseFloat(produto.preco_unitario) * parseInt(produto.quantidade));
                }, 0);
            }

            // Subtotal (antes do desconto)
            let subtotal = valorServico + valorProdutos;

            // Calcular desconto se houver promoção
            let valorDesconto = 0;
            if (promocao_id) {
                const promocaoResult = await pool.query(
                    'SELECT percentual_desconto FROM promocoes WHERE id = $1 AND current_date BETWEEN data_inicio AND data_fim',
                    [promocao_id]
                );

                if (promocaoResult.rows.length > 0) {
                    const percentualDesconto = promocaoResult.rows[0].percentual_desconto;
                    valorDesconto = (subtotal * percentualDesconto) / 100;
                }
            }

            // Calcular total final
            const total = subtotal - valorDesconto;

            res.json({
                total: total,
                detalhes: {
                    servico: valorServico,
                    produtos: valorProdutos,
                    subtotal: subtotal,
                    desconto: valorDesconto
                }
            });
        } catch (error) {
            console.error('Erro ao calcular total:', error);
            res.status(500).json({ message: 'Erro ao calcular total' });
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
                    pr.titulo as promocao_titulo,
                    pr.percentual_desconto as promocao_desconto
                FROM atendimentos a
                LEFT JOIN clientes c ON a.cliente_id = c.id
                LEFT JOIN profissionais p ON a.profissional_id = p.id
                LEFT JOIN promocoes pr ON a.promocao_id = pr.id
                WHERE a.cliente_id = $1
                ORDER BY a.data_atendimento DESC
            `, [cliente_id]);

            for (let atendimento of result.rows) {
                const produtosResult = await pool.query(`
                    SELECT 
                        ap.*,
                        p.nome as produto_nome
                    FROM atendimento_produtos ap
                    JOIN produtos p ON ap.produto_id = p.id
                    WHERE ap.atendimento_id = $1
                `, [atendimento.id]);
                
                atendimento.produtos = produtosResult.rows;
            }

            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar atendimentos do cliente:', error);
            res.status(500).json({ message: 'Erro ao buscar atendimentos do cliente' });
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
                    pr.titulo as promocao_titulo,
                    pr.percentual_desconto as promocao_desconto
                FROM atendimentos a
                LEFT JOIN clientes c ON a.cliente_id = c.id
                LEFT JOIN profissionais p ON a.profissional_id = p.id
                LEFT JOIN promocoes pr ON a.promocao_id = pr.id
                WHERE a.profissional_id = $1
                ORDER BY a.data_atendimento DESC
            `, [profissional_id]);

            for (let atendimento of result.rows) {
                const produtosResult = await pool.query(`
                    SELECT 
                        ap.*,
                        p.nome as produto_nome
                    FROM atendimento_produtos ap
                    JOIN produtos p ON ap.produto_id = p.id
                    WHERE ap.atendimento_id = $1
                `, [atendimento.id]);
                
                atendimento.produtos = produtosResult.rows;
            }

            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao buscar atendimentos do profissional:', error);
            res.status(500).json({ message: 'Erro ao buscar atendimentos do profissional' });
        }
    }
};

module.exports = atendimentoController;