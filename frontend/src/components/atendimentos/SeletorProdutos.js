import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, X, Package } from 'lucide-react';
import api from '../../services/api';

const SeletorProdutos = ({ onSelect, produtosSelecionados = [] }) => {
    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [showLista, setShowLista] = useState(false);

    // Carregar produtos
    const carregarProdutos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/produtos');
            // Filtrar apenas produtos com estoque disponível
            const produtosDisponiveis = response.data.filter(p => p.estoque > 0);
            setProdutos(produtosDisponiveis);
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

    // Adicionar produto
    const handleSelect = (produto) => {
        const produtoExistente = produtosSelecionados.find(p => p.produto_id === produto.id);
        if (produtoExistente) {
            if (produtoExistente.quantidade < produto.estoque) {
                const novosProdutos = produtosSelecionados.map(p =>
                    p.produto_id === produto.id
                        ? { ...p, quantidade: p.quantidade + 1 }
                        : p
                );
                onSelect(novosProdutos);
            }
        } else {
            const novoProduto = {
                produto_id: produto.id,
                produto_nome: produto.nome,
                quantidade: 1,
                preco_unitario: produto.preco,
                estoque_disponivel: produto.estoque
            };
            onSelect([...produtosSelecionados, novoProduto]);
        }
        setBusca('');
        setShowLista(false);
    };

    // Remover produto
    const handleRemover = (produtoId) => {
        const novosProdutos = produtosSelecionados.filter(p => p.produto_id !== produtoId);
        onSelect(novosProdutos);
    };

    // Alterar quantidade
    const handleQuantidade = (produtoId, delta) => {
        const produto = produtosSelecionados.find(p => p.produto_id === produtoId);
        if (!produto) return;

        const novaQuantidade = produto.quantidade + delta;
        if (novaQuantidade < 1 || novaQuantidade > produto.estoque_disponivel) return;

        const novosProdutos = produtosSelecionados.map(p =>
            p.produto_id === produtoId
                ? { ...p, quantidade: novaQuantidade }
                : p
        );
        onSelect(novosProdutos);
    };

    // Formatar preço
    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    return (
        <div>
            {/* Campo de busca */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={busca}
                    onChange={(e) => {
                        setBusca(e.target.value);
                        setShowLista(true);
                    }}
                    onFocus={() => setShowLista(true)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Lista de produtos */}
                {showLista && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-64 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                Carregando...
                            </div>
                        ) : erro ? (
                            <div className="p-4 text-center text-red-500">
                                {erro}
                            </div>
                        ) : produtosFiltrados.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                Nenhum produto encontrado
                            </div>
                        ) : (
                            produtosFiltrados.map((produto) => (
                                <button
                                    key={produto.id}
                                    onClick={() => handleSelect(produto)}
                                    className="w-full px-4 py-2 text-left hover:bg-purple-50 focus:outline-none focus:bg-purple-50"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">{produto.nome}</p>
                                            <p className="text-sm text-gray-500">{produto.descricao}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-purple-600">
                                                {formatarPreco(produto.preco)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Estoque: {produto.estoque}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Lista de produtos selecionados */}
            {produtosSelecionados.length > 0 && (
                <div className="space-y-2">
                    {produtosSelecionados.map((produto) => (
                        <div 
                            key={produto.produto_id}
                            className="flex items-center justify-between bg-purple-50 p-3 rounded-lg"
                        >
                            <div className="flex-1">
                                <p className="font-medium text-purple-900">
                                    {produto.produto_nome}
                                </p>
                                <p className="text-sm text-purple-700">
                                    {formatarPreco(produto.preco_unitario * produto.quantidade)}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleQuantidade(produto.produto_id, -1)}
                                    disabled={produto.quantidade <= 1}
                                    className="p-1 text-purple-700 hover:text-purple-900 disabled:opacity-50"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">
                                    {produto.quantidade}
                                </span>
                                <button
                                    onClick={() => handleQuantidade(produto.produto_id, 1)}
                                    disabled={produto.quantidade >= produto.estoque_disponivel}
                                    className="p-1 text-purple-700 hover:text-purple-900 disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleRemover(produto.produto_id)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SeletorProdutos;