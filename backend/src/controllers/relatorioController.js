const pool = require('../database/connection');

const relatorioController = {
    async getComissoesPorPeriodo(req, res) {
        try {
            const { data_inicio, data_fim, profissional_id } = req.query;

            let query = `
                WITH profissional_valores AS (
                    SELECT 
                        p.nome as profissional,
                        COALESCE(c.percentual, (SELECT percentual_comissao_padrao FROM configuracoes LIMIT 1)) as percentual_medio,
                        COUNT(DISTINCT CASE WHEN a.data_atendimento BETWEEN $1 AND $2 THEN a.id END) as total_atendimentos,
                        COALESCE(SUM(CASE WHEN a.data_atendimento BETWEEN $1 AND $2 THEN a.preco ELSE 0 END), 0) as valor_servicos,
                        COALESCE(SUM(CASE WHEN a.data_atendimento BETWEEN $1 AND $2 THEN ap.quantidade * ap.preco_unitario ELSE 0 END), 0) as valor_produtos
                    FROM profissionais p
                    LEFT JOIN atendimentos a ON a.profissional_id = p.id
                    LEFT JOIN atendimento_produtos ap ON ap.atendimento_id = a.id
                    LEFT JOIN comissoes c ON c.profissional_id = p.id
                    WHERE ($3::uuid IS NULL OR p.id = $3)
                    GROUP BY 
                        p.nome,
                        c.percentual
                )
                SELECT 
                    profissional,
                    total_atendimentos,
                    valor_servicos,
                    valor_produtos,
                    percentual_medio,
                    ((valor_servicos + valor_produtos) * (percentual_medio / 100)) as valor_comissao
                FROM profissional_valores
                ORDER BY profissional
            `;

            const params = [
                data_inicio,
                data_fim,
                profissional_id || null
            ];

            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Erro:', error);
            res.status(500).json({ error: 'Erro ao buscar comissões' });
        }
    }
};

module.exports = relatorioController;