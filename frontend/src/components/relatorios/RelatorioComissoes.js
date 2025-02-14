import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const RelatorioComissoes = () => {
    const [filtros, setFiltros] = useState({
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: new Date().toISOString().split('T')[0],
        profissional_id: ''
    });
    const [comissoes, setComissoes] = useState([]);
    const [profissionais, setProfissionais] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    // Função para carregar profissionais
    const carregarProfissionais = async () => {
        try {
            const response = await api.get('/api/profissionais');
            setProfissionais(response.data);
        } catch (error) {
            console.error('Erro ao carregar profissionais:', error);
            setErro('Erro ao carregar lista de profissionais');
        }
    };

    // Carrega profissionais quando o componente monta
    useEffect(() => {
        carregarProfissionais();
    }, []);

    const carregarComissoes = async () => {
        setLoading(true);
        setErro('');
        try {
            const response = await api.get('/api/relatorios/comissoes', {
                params: filtros
            });
            setComissoes(response.data);
        } catch (error) {
            console.error('Erro ao carregar comissões:', error);
            setErro('Erro ao carregar comissões');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltrar = (e) => {
        e.preventDefault();
        carregarComissoes();
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Relatório de Comissões</h2>
            
            {erro && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {erro}
                </div>
            )}

            {/* Filtros */}
            <form onSubmit={handleFiltrar} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Data Início
                        </label>
                        <input
                            type="date"
                            value={filtros.data_inicio}
                            onChange={e => setFiltros({...filtros, data_inicio: e.target.value})}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Data Fim
                        </label>
                        <input
                            type="date"
                            value={filtros.data_fim}
                            onChange={e => setFiltros({...filtros, data_fim: e.target.value})}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Profissional
                        </label>
                        <select
                            value={filtros.profissional_id}
                            onChange={e => setFiltros({...filtros, profissional_id: e.target.value})}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Todos</option>
                            {profissionais.map(prof => (
                                <option key={prof.id} value={prof.id}>
                                    {prof.nome} - {prof.especialidade}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Carregando...' : 'Filtrar'}
                </button>
            </form>

            {/* Tabela de Resultados */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Profissional
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Atendimentos
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Total Serviços
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor Total Comissões
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                % Médio
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {comissoes.map((item, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{item.profissional}</div>
                                    <div className="text-sm text-gray-500">{item.especialidade}</div>
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-gray-500">
                                    {item.total_atendimentos}
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-gray-500">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(item.valor_total_servicos)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-gray-500">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(item.valor_total_comissoes)}
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-gray-500">
                                    {Number(item.percentual_medio).toFixed(2)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RelatorioComissoes;