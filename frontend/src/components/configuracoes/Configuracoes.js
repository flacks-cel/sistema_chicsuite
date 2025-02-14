import React, { useState, useEffect } from 'react';
import { Save, Send, Percent } from 'lucide-react';
import api from '../../services/api';

const Configuracoes = () => {
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [sucessoEmail, setSucessoEmail] = useState('');
    const [activeTab, setActiveTab] = useState('geral');
    const [config, setConfig] = useState({
        nome_salao: '',
        endereco: '',
        telefone: '',
        email: '',
        percentual_comissao_padrao: 30,
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_pass: '',
        smtp_from: ''
    });
    const [comissoes, setComissoes] = useState([]);

    // Carregar configurações
    useEffect(() => {
        const carregarDados = async () => {
            try {
                setLoading(true);
                const [configResponse, comissoesResponse] = await Promise.all([
                    api.get('/api/configuracoes'),
                    api.get('/api/configuracoes/comissoes')
                ]);
                setConfig(configResponse.data);
                setComissoes(comissoesResponse.data);
                setErro('');
            } catch (error) {
                setErro('Erro ao carregar configurações');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        carregarDados();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleComissaoChange = async (profissionalId, novoPercentual) => {
        try {
            await api.put(`/api/configuracoes/comissoes/${profissionalId}`, {
                percentual: novoPercentual
            });

            // Atualizar lista de comissões
            const response = await api.get('/api/configuracoes/comissoes');
            setComissoes(response.data);
            setErro('');
        } catch (error) {
            setErro('Erro ao atualizar comissão');
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);
        setErro('');

        try {
            await api.put('/api/configuracoes', config);
            setSalvando(false);
        } catch (error) {
            setErro('Erro ao salvar configurações');
            console.error(error);
            setSalvando(false);
        }
    };

    const testarEmail = async () => {
        try {
            setSucessoEmail('');
            setErro('');
            const response = await api.post('/api/configuracoes/testar-email');
            setSucessoEmail('Email de teste enviado com sucesso!');
        } catch (error) {
            setErro('Erro ao enviar email de teste');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-gray-600">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>

            {/* Tabs */}
            <div className="mb-6 border-b">
                <nav className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('geral')}
                        className={`py-2 px-4 ${
                            activeTab === 'geral'
                                ? 'border-b-2 border-purple-500 text-purple-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Dados do Salão
                    </button>
                    <button
                        onClick={() => setActiveTab('comissoes')}
                        className={`py-2 px-4 ${
                            activeTab === 'comissoes'
                                ? 'border-b-2 border-purple-500 text-purple-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Comissões
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`py-2 px-4 ${
                            activeTab === 'email'
                                ? 'border-b-2 border-purple-500 text-purple-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Email
                    </button>
                </nav>
            </div>

            {/* Mensagens */}
            {erro && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {erro}
                </div>
            )}
            {sucessoEmail && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {sucessoEmail}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Configurações Gerais */}
                {activeTab === 'geral' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome do Salão
                            </label>
                            <input
                                type="text"
                                name="nome_salao"
                                value={config.nome_salao}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Endereço
                            </label>
                            <input
                                type="text"
                                name="endereco"
                                value={config.endereco}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefone
                                </label>
                                <input
                                    type="text"
                                    name="telefone"
                                    value={config.telefone}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={config.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Configurações de Comissões */}
                {activeTab === 'comissoes' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Percentual de Comissão Padrão
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    name="percentual_comissao_padrao"
                                    value={config.percentual_comissao_padrao}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-32 p-2 border rounded-l focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <span className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r">
                                    %
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">
                                Comissões por Profissional
                            </h3>
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Profissional
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Especialidade
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Comissão
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {comissoes.map((comissao) => (
                                            <tr key={comissao.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {comissao.nome}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {comissao.especialidade}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="number"
                                                            value={comissao.percentual}
                                                            onChange={(e) => handleComissaoChange(
                                                                comissao.id,
                                                                e.target.value
                                                            )}
                                                            min="0"
                                                            max="100"
                                                            step="0.1"
                                                            className="w-20 p-1 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        />
                                                        <span className="ml-2">%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Configurações de Email */}
                {activeTab === 'email' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Servidor SMTP
                            </label>
                            <input
                                type="text"
                                name="smtp_host"
                                value={config.smtp_host}
                                onChange={handleChange}
                                placeholder="smtp.exemplo.com"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Porta SMTP
                            </label>
                            <input
                                type="text"
                                name="smtp_port"
                                value={config.smtp_port}
                                onChange={handleChange}
                                placeholder="587"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Usuário SMTP
                            </label>
                            <input
                                type="text"
                                name="smtp_user"
                                value={config.smtp_user}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Senha SMTP
                            </label>
                            <input
                                type="password"
                                name="smtp_pass"
                                value={config.smtp_pass}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email de Envio
                            </label>
                            <input
                                type="email"
                                name="smtp_from"
                                value={config.smtp_from}
                                onChange={handleChange}
                                placeholder="noreply@seusalao.com"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={testarEmail}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Testar Configurações
                            </button>
                        </div>
                    </div>
                )}

                {/* Botão Salvar */}
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={salvando}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {salvando ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Configuracoes;