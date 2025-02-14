import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Package, MinusCircle, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import FormProduto from './FormProduto';

const ListaProdutos = () => {
    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
    const [showEstoqueModal, setShowEstoqueModal] = useState(false);
    const [produtoEstoque, setProdutoEstoque] = useState(null);

    // Carregar produtos
    const carregarProdutos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/produtos');
            setProdutos(response.data);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar produtos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarProdutos();
    }, []);

    // Filtrar produtos
    const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
        produto.descricao?.toLowerCase().includes(busca.toLowerCase())
    );

    // Abrir modal para edição
    const handleEditar = (produto) => {
        setProdutoEmEdicao(produto);
        setShowModal(true);
    };

    // Abrir modal para ajuste de estoque
    const handleAjusteEstoque = (produto) => {
        setProdutoEstoque(produto);
        setShowEstoqueModal(true);
    };

    // Excluir produto
    const handleExcluir = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

        try {
            await api.delete(`/api/produtos/${id}`);
            await carregarProdutos();
        } catch (error) {
            setErro(error.response?.data?.message || 'Erro ao excluir produto');
        }
    };

    // Formatar preço
    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    // Atualizar estoque
    const handleAtualizarEstoque = async (id, quantidade) => {
        try {
            await api.patch(`/api/produtos/${id}/estoque`, { quantidade });
            await carregarProdutos();
            setShowEstoqueModal(false);
            setProdutoEstoque(null);
        } catch (error) {
            setErro(error.response?.data?.message || 'Erro ao atualizar estoque');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
                <button
                    onClick={() => {
                        setProdutoEmEdicao(null);
                        setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Package className="w-5 h-5 mr-2" />
                    Novo Produto
                </button>
            </div>

            {/* Barra de busca */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
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

            {/* Tabela de produtos */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descrição
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Preço
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estoque
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">
                                    Carregando...
                                </td>
                            </tr>
                        ) : produtosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">
                                    Nenhum produto encontrado
                                </td>
                            </tr>
                        ) : (
                            produtosFiltrados.map((produto) => (
                                <tr key={produto.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {produto.nome}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs truncate">
                                            {produto.descricao}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatarPreco(produto.preco)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            produto.estoque > 10 
                                                ? 'bg-green-100 text-green-800'
                                                : produto.estoque > 0
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}>
                                            {produto.estoque} unidades
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleAjusteEstoque(produto)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Ajustar Estoque"
                                            >
                                                <Package className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEditar(produto)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Editar"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleExcluir(produto.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Formulário */}
            {showModal && (
                <FormProduto
                    produto={produtoEmEdicao}
                    onClose={() => {
                        setShowModal(false);
                        setProdutoEmEdicao(null);
                    }}
                    onSave={() => {
                        carregarProdutos();
                        setShowModal(false);
                        setProdutoEmEdicao(null);
                    }}
                />
            )}

            {/* Modal de Ajuste de Estoque */}
            {showEstoqueModal && produtoEstoque && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Ajustar Estoque</h2>
                        <p className="mb-4">
                            Produto: {produtoEstoque.nome}
                            <br />
                            Estoque atual: {produtoEstoque.estoque} unidades
                        </p>
                        <div className="flex justify-around mb-4">
                            <button
                                onClick={() => handleAtualizarEstoque(produtoEstoque.id, -1)}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                <MinusCircle className="w-5 h-5 mr-2" />
                                Remover 1
                            </button>
                            <button
                                onClick={() => handleAtualizarEstoque(produtoEstoque.id, 1)}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Adicionar 1
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setShowEstoqueModal(false);
                                setProdutoEstoque(null);
                            }}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaProdutos;