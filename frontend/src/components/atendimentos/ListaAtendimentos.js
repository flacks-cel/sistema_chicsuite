import React, { useState, useEffect } from 'react';
import { Search, Calendar, Plus, FileText, Eye } from 'lucide-react';
import api from '../../services/api';
import FormAtendimento from './FormAtendimento';

const ListaAtendimentos = () => {
    const [atendimentos, setAtendimentos] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetalhes, setShowDetalhes] = useState(false);
    const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);

    // Carregar atendimentos
    const carregarAtendimentos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/atendimentos');
            setAtendimentos(response.data);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar atendimentos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarAtendimentos();
    }, []);

    // Filtrar atendimentos
    const atendimentosFiltrados = atendimentos.filter(atendimento =>
        atendimento.cliente_nome?.toLowerCase().includes(busca.toLowerCase()) ||
        atendimento.profissional_nome?.toLowerCase().includes(busca.toLowerCase()) ||
        atendimento.servico?.toLowerCase().includes(busca.toLowerCase())
    );

    // Formatar preço
    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    // Formatar data
    const formatarData = (data) => {
        return new Date(data).toLocaleString('pt-BR');
    };

    // Calcular valor total de produtos
    const calcularTotalProdutos = (produtos) => {
        if (!produtos || produtos.length === 0) return 0;
        return produtos.reduce((total, produto) => {
            return total + (parseFloat(produto.quantidade) * parseFloat(produto.preco_unitario));
        }, 0);
    };

    // Calcular valor total do atendimento
    const calcularValorTotal = (atendimento) => {
        // Valor do serviço
        let subtotal = parseFloat(atendimento.preco) || 0;

        // Adicionar valor dos produtos
        const totalProdutos = calcularTotalProdutos(atendimento.produtos);
        subtotal += totalProdutos;

        // Aplicar desconto da promoção se houver
        if (atendimento.promocao_desconto) {
            const desconto = (subtotal * parseFloat(atendimento.promocao_desconto)) / 100;
            return subtotal - desconto;
        }

        return subtotal;
    };

    // Ver detalhes do atendimento
    const handleVerDetalhes = (atendimento) => {
        setAtendimentoSelecionado(atendimento);
        setShowDetalhes(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Atendimentos</h1>
                <button
                    onClick={() => {
                        setAtendimentoSelecionado(null);
                        setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Calendar className="w-5 h-5 mr-2" />
                    Novo Atendimento
                </button>
            </div>

            {/* Barra de busca */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar atendimentos..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Mensagem de erro */}
            {erro && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {erro}
                </div>
            )}

            {/* Lista de atendimentos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-8">
                        Carregando...
                    </div>
                ) : atendimentosFiltrados.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                        Nenhum atendimento encontrado
                    </div>
                ) : (
                    atendimentosFiltrados.map((atendimento) => (
                        <div 
                            key={atendimento.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {atendimento.cliente_nome}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {formatarData(atendimento.data_atendimento)}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                                        {atendimento.forma_pagamento}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-gray-600">
                                        <strong>Profissional:</strong> {atendimento.profissional_nome}
                                    </p>
                                    <p className="text-gray-600">
                                        <strong>Serviço:</strong> {atendimento.servico}
                                    </p>
                                    <div className="border-t pt-2 mt-2">
                                        <p className="text-gray-600">
                                            <strong>Valor Serviço:</strong> {formatarPreco(atendimento.preco)}
                                        </p>
                                        {atendimento.produtos && atendimento.produtos.length > 0 && (
                                            <p className="text-gray-600">
                                                <strong>Valor Produtos:</strong> {formatarPreco(calcularTotalProdutos(atendimento.produtos))}
                                            </p>
                                        )}
                                        {atendimento.promocao_titulo && (
                                            <p className="text-green-600">
                                                <strong>Promoção:</strong> {atendimento.promocao_titulo} ({atendimento.promocao_desconto}% off)
                                            </p>
                                        )}
                                        <p className="text-lg font-bold text-purple-600 mt-2 border-t pt-2">
                                            Total: {formatarPreco(calcularValorTotal(atendimento))}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                                    <button
                                        onClick={() => handleVerDetalhes(atendimento)}
                                        className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Formulário */}
            {showModal && (
                <FormAtendimento
                    atendimento={atendimentoSelecionado}
                    onClose={() => {
                        setShowModal(false);
                        setAtendimentoSelecionado(null);
                    }}
                    onSave={() => {
                        carregarAtendimentos();
                        setShowModal(false);
                        setAtendimentoSelecionado(null);
                    }}
                />
            )}

            {/* Modal de Detalhes */}
            {showDetalhes && atendimentoSelecionado && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Detalhes do Atendimento
                            </h2>
                            <button
                                onClick={() => {
                                    setShowDetalhes(false);
                                    setAtendimentoSelecionado(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FileText className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h3 className="font-semibold text-gray-700">Cliente</h3>
                                    <p>{atendimentoSelecionado.cliente_nome}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">Profissional</h3>
                                    <p>{atendimentoSelecionado.profissional_nome}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">Data</h3>
                                    <p>{formatarData(atendimentoSelecionado.data_atendimento)}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">Forma de Pagamento</h3>
                                    <p className="capitalize">{atendimentoSelecionado.forma_pagamento}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-700 mb-2">Serviço</h3>
                                <p>{atendimentoSelecionado.servico}</p>
                                <p className="text-purple-600 font-semibold mt-1">
                                    {formatarPreco(atendimentoSelecionado.preco)}
                                </p>
                            </div>

                            {atendimentoSelecionado.produtos && atendimentoSelecionado.produtos.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-700 mb-2">Produtos</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        {atendimentoSelecionado.produtos.map((produto, index) => (
                                            <div 
                                                key={index}
                                                className="flex justify-between items-center py-2 border-b last:border-0"
                                            >
                                                <div>
                                                    <p className="font-medium">{produto.produto_nome}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Quantidade: {produto.quantidade}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        {formatarPreco(produto.preco_unitario * produto.quantidade)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatarPreco(produto.preco_unitario)} cada
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-2 mt-2 border-t">
                                            <p className="font-medium">Total Produtos:</p>
                                            <p className="font-medium">
                                                {formatarPreco(calcularTotalProdutos(atendimentoSelecionado.produtos))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {atendimentoSelecionado.promocao_titulo && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-700 mb-2">Promoção Aplicada</h3>
                                    <div className="flex justify-between items-center bg-green-50 rounded-lg p-4">
                                        <p className="text-green-700">{atendimentoSelecionado.promocao_titulo}</p>
                                        <p className="font-medium text-green-700">
                                            {atendimentoSelecionado.promocao_desconto}% de desconto
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800">Valor Total</h3>
                                    <p className="text-lg font-bold text-purple-600">
                                        {formatarPreco(calcularValorTotal(atendimentoSelecionado))}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => {
                                        setShowDetalhes(false);
                                        setAtendimentoSelecionado(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaAtendimentos;