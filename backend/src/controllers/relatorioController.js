const pool = require('../database/connection');

const relatorioController = {
    async getComissoesPorPeriodo(req, res) {
        const { data_inicio, data_fim, profissional_id } = req.query;
        
        try {
            console.log('Buscando comissões com parâmetros:', { data_inicio, data_fim, profissional_id });

            let query = `
                SELECT 
                    p.id,
                    p.nome as profissional,
                    p.especialidade,
                    COUNT(a.id) as total_atendimentos,
                    COALESCE(SUM(a.preco), 0) as valor_total_servicos,
                    COALESCE(SUM(a.valor_comissao), 0) as valor_total_comissoes,
                    COALESCE(AVG(
                        CASE 
                            WHEN c.percentual IS NOT NULL THEN c.percentual
                            ELSE (SELECT percentual_comissao_padrao FROM configuracoes LIMIT 1)
                        END
                    ), 0) as percentual_medio
                FROM profissionais p
                LEFT JOIN atendimentos a ON a.profissional_id = p.id
                LEFT JOIN comissoes c ON c.profissional_id = p.id
            `;

            const params = [];
            const conditions = [];

            if (data_inicio && data_fim) {
                params.push(data_inicio, data_fim);
                conditions.push(`a.data_atendimento BETWEEN $${params.length - 1} AND $${params.length}`);
            }

            if (profissional_id) {
                params.push(profissional_id);
                conditions.push(`p.id = $${params.length}`);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += `
                GROUP BY 
                    p.id, 
                    p.nome, 
                    p.especialidade
                ORDER BY p.nome
            `;

            console.log('Executando query:', query);
            console.log('Com parâmetros:', params);

            const result = await pool.query(query, params);
            
            const formattedResults = result.rows.map(row => ({
                ...row,
                valor_total_servicos: Number(row.valor_total_servicos),
                valor_total_comissoes: Number(row.valor_total_comissoes),
                percentual_medio: Number(row.percentual_medio),
                total_atendimentos: Number(row.total_atendimentos)
            }));

            console.log('Resultados encontrados:', formattedResults.length);
            res.json(formattedResults);
        } catch (error) {
            console.error('Erro ao buscar comissões:', error);
            res.status(500).json({ 
                error: 'Erro ao buscar comissões',
                details: error.message 
            });
        }
    }
};

module.exports = relatorioController;