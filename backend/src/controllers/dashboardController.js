const pool = require('../database/connection');

const dashboardController = {
    async getDashboardData(req, res) {
        const client = await pool.connect();
        try {
            // Início das transações
            await client.query('BEGIN');

            // Total de vendas do dia
            const vendasHoje = await client.query(`
                SELECT COALESCE(SUM(a.preco), 0) as total
                FROM atendimentos a
                WHERE DATE(a.data_atendimento) = CURRENT_DATE
            `);

            // Total de vendas do mês
            const vendasMes = await client.query(`
                SELECT COALESCE(SUM(a.preco), 0) as total
                FROM atendimentos a
                WHERE DATE_TRUNC('month', a.data_atendimento) = DATE_TRUNC('month', CURRENT_DATE)
            `);

            // Produtos mais vendidos
            const produtosMaisVendidos = await client.query(`
                SELECT 
                    p.nome,
                    SUM(ap.quantidade) as quantidade_total,
                    SUM(ap.quantidade * ap.preco_unitario) as valor_total
                FROM atendimento_produtos ap
                JOIN produtos p ON p.id = ap.produto_id
                GROUP BY p.id, p.nome
                ORDER BY quantidade_total DESC
                LIMIT 5
            `);

            // Profissionais mais produtivos
            const profissionaisMaisProdutivos = await client.query(`
                SELECT 
                    p.nome,
                    COUNT(a.id) as total_atendimentos,
                    COALESCE(SUM(a.preco), 0) as valor_total
                FROM profissionais p
                LEFT JOIN atendimentos a ON a.profissional_id = p.id
                WHERE DATE_TRUNC('month', a.data_atendimento) = DATE_TRUNC('month', CURRENT_DATE)
                GROUP BY p.id, p.nome
                ORDER BY valor_total DESC
                LIMIT 5
            `);

            // Clientes mais frequentes
            const clientesMaisFrequentes = await client.query(`
                SELECT 
                    c.nome,
                    COUNT(a.id) as total_visitas,
                    COALESCE(SUM(a.preco), 0) as valor_total
                FROM clientes c
                LEFT JOIN atendimentos a ON a.cliente_id = c.id
                GROUP BY c.id, c.nome
                ORDER BY total_visitas DESC
                LIMIT 5
            `);

            // Vendas por forma de pagamento
            const vendasPorFormaPagamento = await client.query(`
                SELECT 
                    forma_pagamento,
                    COUNT(*) as quantidade,
                    COALESCE(SUM(preco), 0) as valor_total
                FROM atendimentos
                WHERE DATE_TRUNC('month', data_atendimento) = DATE_TRUNC('month', CURRENT_DATE)
                GROUP BY forma_pagamento
            `);

            // Vendas dos últimos 7 dias
            const vendasUltimos7Dias = await client.query(`
                SELECT 
                    DATE(data_atendimento) as data,
                    COUNT(*) as quantidade,
                    COALESCE(SUM(preco), 0) as valor_total
                FROM atendimentos
                WHERE data_atendimento >= CURRENT_DATE - INTERVAL '6 days'
                GROUP BY DATE(data_atendimento)
                ORDER BY data
            `);

            // Promoções ativas
            const promoesAtivas = await client.query(`
                SELECT 
                    titulo,
                    percentual_desconto,
                    data_fim
                FROM promocoes
                WHERE CURRENT_DATE BETWEEN data_inicio AND data_fim
                ORDER BY data_fim ASC
            `);

            // Produtos com estoque baixo
            const produtosEstoqueBaixo = await client.query(`
                SELECT 
                    nome,
                    estoque,
                    preco
                FROM produtos
                WHERE estoque <= 5
                ORDER BY estoque ASC
            `);

            await client.query('COMMIT');

            res.json({
                resumo: {
                    vendas_hoje: vendasHoje.rows[0].total,
                    vendas_mes: vendasMes.rows[0].total
                },
                produtos_mais_vendidos: produtosMaisVendidos.rows,
                profissionais_mais_produtivos: profissionaisMaisProdutivos.rows,
                clientes_mais_frequentes: clientesMaisFrequentes.rows,
                vendas_por_pagamento: vendasPorFormaPagamento.rows,
                vendas_ultimos_7_dias: vendasUltimos7Dias.rows,
                promocoes_ativas: promoesAtivas.rows,
                produtos_estoque_baixo: produtosEstoqueBaixo.rows
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao buscar dados do dashboard:', error);
            res.status(500).json({ message: 'Erro ao buscar dados do dashboard' });
        } finally {
            client.release();
        }
    }
};

module.exports = dashboardController;