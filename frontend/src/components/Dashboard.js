import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    DollarSign, 
    Users, 
    ShoppingBag, 
    Award,
    AlertTriangle,
    TrendingUp,
    Calendar
} from 'lucide-react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import api from '../services/api';

// Componente para exibir cards de resumo
const SummaryCard = ({ title, value, icon: Icon, bgColor }) => (
    <div className={`${bgColor} text-white rounded-lg shadow-lg p-6`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm opacity-75">{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
            </div>
            <Icon className="w-12 h-12 opacity-25" />
        </div>
    </div>
);

// Componente para exibir gráficos de linha
const LineChartComponent = ({ data, title, xAxisKey, yAxisKey, formatXAxis, formatYAxis }) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} />
                    <YAxis tickFormatter={formatYAxis} />
                    <Tooltip formatter={formatYAxis} labelFormatter={formatXAxis} />
                    <Line type="monotone" dataKey={yAxisKey} stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// Componente para exibir gráficos de barras
const BarChartComponent = ({ data, title, xAxisKey, yAxisKey, formatXAxis, formatYAxis }) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} />
                    <YAxis tickFormatter={formatYAxis} />
                    <Tooltip formatter={formatYAxis} labelFormatter={formatXAxis} />
                    <Bar dataKey={yAxisKey} fill="#8b5cf6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// Componente para exibir rankings
const RankingList = ({ title, icon: Icon, data, valueKey, labelKey, subLabelKey }) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Icon className="w-5 h-5 mr-2" />
            {title}
        </h3>
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-lg font-bold text-purple-600 w-6">{index + 1}</span>
                        <div className="ml-3">
                            <p className="font-medium text-gray-800">{item[labelKey]}</p>
                            <p className="text-sm text-gray-500">{item[subLabelKey]}</p>
                        </div>
                    </div>
                    <span className="font-medium text-gray-800">{valueKey(item)}</span>
                </div>
            ))}
        </div>
    </div>
);

// Componente para exibir alertas
const AlertList = ({ title, icon: Icon, data, bgColor, textColor, labelKey, subLabelKey, valueKey }) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Icon className="w-5 h-5 mr-2" />
            {title}
        </h3>
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-3 ${bgColor} rounded-lg`}>
                    <div>
                        <p className={`font-medium ${textColor}`}>{item[labelKey]}</p>
                        <p className={`text-sm ${textColor}`}>{item[subLabelKey]}</p>
                    </div>
                    <p className={`font-medium ${textColor}`}>{valueKey(item)}</p>
                </div>
            ))}
            {data.length === 0 && (
                <p className="text-gray-500 text-center">Nenhum item encontrado</p>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/dashboard');
            setData(response.data);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar dados do dashboard');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-gray-600">Carregando...</div>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {erro}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="p-6 space-y-6">
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard 
                    title="Vendas Hoje" 
                    value={formatarMoeda(data.resumo.vendas_hoje)} 
                    icon={DollarSign} 
                    bgColor="bg-purple-600" 
                />
                <SummaryCard 
                    title="Vendas do Mês" 
                    value={formatarMoeda(data.resumo.vendas_mes)} 
                    icon={Calendar} 
                    bgColor="bg-blue-600" 
                />
                <SummaryCard 
                    title="Promoções Ativas" 
                    value={data.promocoes_ativas.length} 
                    icon={Award} 
                    bgColor="bg-green-600" 
                />
                <SummaryCard 
                    title="Produtos em Baixa" 
                    value={data.produtos_estoque_baixo.length} 
                    icon={AlertTriangle} 
                    bgColor="bg-red-600" 
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartComponent 
                    data={data.vendas_ultimos_7_dias} 
                    title="Vendas dos Últimos 7 Dias" 
                    xAxisKey="data" 
                    yAxisKey="valor_total" 
                    formatXAxis={formatarData} 
                    formatYAxis={formatarMoeda} 
                />
                <BarChartComponent 
                    data={data.vendas_por_pagamento} 
                    title="Vendas por Forma de Pagamento" 
                    xAxisKey="forma_pagamento" 
                    yAxisKey="valor_total" 
                    formatXAxis={(value) => value.charAt(0).toUpperCase() + value.slice(1)} 
                    formatYAxis={formatarMoeda} 
                />
            </div>

            {/* Rankings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <RankingList 
                    title="Produtos Mais Vendidos" 
                    icon={ShoppingBag} 
                    data={data.produtos_mais_vendidos} 
                    valueKey={(item) => formatarMoeda(item.valor_total)} 
                    labelKey="nome" 
                    subLabelKey="quantidade_total" 
                />
                <RankingList 
                    title="Profissionais Mais Produtivos" 
                    icon={Award} 
                    data={data.profissionais_mais_produtivos} 
                    valueKey={(item) => formatarMoeda(item.valor_total)} 
                    labelKey="nome" 
                    subLabelKey="total_atendimentos" 
                />
                <RankingList 
                    title="Clientes Mais Frequentes" 
                    icon={Users} 
                    data={data.clientes_mais_frequentes} 
                    valueKey={(item) => formatarMoeda(item.valor_total)} 
                    labelKey="nome" 
                    subLabelKey="total_visitas" 
                />
            </div>

            {/* Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AlertList 
                    title="Promoções Ativas" 
                    icon={Award} 
                    data={data.promocoes_ativas} 
                    bgColor="bg-purple-50" 
                    textColor="text-purple-800" 
                    labelKey="titulo" 
                    subLabelKey="percentual_desconto" 
                    valueKey={(item) => `Até ${formatarData(item.data_fim)}`} 
                />
                <AlertList 
                    title="Produtos com Estoque Baixo" 
                    icon={AlertTriangle} 
                    data={data.produtos_estoque_baixo} 
                    bgColor="bg-red-50" 
                    textColor="text-red-800" 
                    labelKey="nome" 
                    subLabelKey="estoque" 
                    valueKey={(item) => formatarMoeda(item.preco)} 
                />
            </div>
        </div>
    );
};

export default Dashboard;