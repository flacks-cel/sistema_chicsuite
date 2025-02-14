import React, { useState, useEffect } from 'react';
import { Search, Tag, X } from 'lucide-react';
import api from '../../services/api';

const SeletorPromocao = ({ onSelect, promocaoSelecionada }) => {
    const [promocoes, setPromocoes] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [showLista, setShowLista] = useState(false);

    // Carregar promoções
    const carregarPromocoes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/promocoes/ativas');
            setPromocoes(response.data);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar promoções');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarPromocoes();
    }, []);

    // Filtrar promoções
    const promocoesFiltradas = promocoes.filter(promocao =>
        promocao.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        promocao.descricao?.toLowerCase().includes(busca.toLowerCase())
    );

    // Selecionar promoção
    const handleSelect = (promocao) => {
        onSelect(promocao);
        setBusca('');
        setShowLista(false);
    };

    // Formatar data
    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    // Renderizar promoção selecionada
    const renderPromocaoSelecionada = () => {
        if (!promocaoSelecionada) return null;

        return (
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-purple-900">
                            {promocaoSelecionada.titulo}
                        </p>
                        <span className="px-2 py-1 text-xs font-semibold bg-purple-200 text-purple-800 rounded-full">
                            {promocaoSelecionada.percentual_desconto}% OFF
                        </span>
                    </div>
                    <p className="text-sm text-purple-700">
                        Válido até {formatarData(promocaoSelecionada.data_fim)}
                    </p>
                </div>
                <button
                    onClick={() => onSelect(null)}
                    className="text-purple-700 hover:text-purple-900"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    };

    return (
        <div className="relative">
            {promocaoSelecionada ? (
                renderPromocaoSelecionada()
            ) : (
                <div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar promoção..."
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setShowLista(true);
                            }}
                            onFocus={() => setShowLista(true)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Lista de promoções */}
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
                            ) : promocoesFiltradas.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    Nenhuma promoção encontrada
                                </div>
                            ) : (
                                promocoesFiltradas.map((promocao) => (
                                    <button
                                        key={promocao.id}
                                        onClick={() => handleSelect(promocao)}
                                        className="w-full px-4 py-2 text-left hover:bg-purple-50 focus:outline-none focus:bg-purple-50"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-800">
                                                        {promocao.titulo}
                                                    </p>
                                                    <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                                                        {promocao.percentual_desconto}% OFF
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {promocao.descricao}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">
                                                    Até {formatarData(promocao.data_fim)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SeletorPromocao;