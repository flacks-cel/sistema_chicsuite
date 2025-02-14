import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Tag, Calendar } from 'lucide-react';
import api from '../../services/api';
import FormPromocao from './FormPromocao';

const ListaPromocoes = () => {
    const [promocoes, setPromocoes] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [promocaoEmEdicao, setPromocaoEmEdicao] = useState(null);

    // Carregar promoções
    const carregarPromocoes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/promocoes');
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

    // Abrir modal para edição
    const handleEditar = (promocao) => {
        setPromocaoEmEdicao(promocao);
        setShowModal(true);
    };

    // Excluir promoção
    const handleExcluir = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta promoção?')) return;

        try {
            await api.delete(`/api/promocoes/${id}`);
            await carregarPromocoes();
        } catch (error) {
            setErro(error.response?.data?.message || 'Erro ao excluir promoção');
        }
    };

    // Formatar data
    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    // Verificar se a promoção está ativa
    const isPromocaoAtiva = (promocao) => {
        const hoje = new Date();
        const dataInicio = new Date(promocao.data_inicio);
        const dataFim = new Date(promocao.data_fim);
        return hoje >= dataInicio && hoje <= dataFim;
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Promoções</h1>
                <button
                    onClick={() => {
                        setPromocaoEmEdicao(null);
                        setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Tag className="w-5 h-5 mr-2" />
                    Nova Promoção
                </button>
            </div>

            {/* Barra de busca */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar promoções..."
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

            {/* Grid de promoções */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-8">
                        Carregando...
                    </div>
                ) : promocoesFiltradas.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                        Nenhuma promoção encontrada
                    </div>
                ) : (
                    promocoesFiltradas.map((promocao) => (
                        <div 
                            key={promocao.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {promocao.titulo}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        isPromocaoAtiva(promocao)
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {isPromocaoAtiva(promocao) ? 'Ativa' : 'Inativa'}
                                    </span>
                                </div>
                                
                                <p className="text-gray-600 mb-4">
                                    {promocao.descricao}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Tag className="w-4 h-4 mr-2" />
                                        {promocao.percentual_desconto}% de desconto
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {formatarData(promocao.data_inicio)} até {formatarData(promocao.data_fim)}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                                    <button
                                        onClick={() => handleEditar(promocao)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleExcluir(promocao.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Formulário */}
            {showModal && (
                <FormPromocao
                    promocao={promocaoEmEdicao}
                    onClose={() => {
                        setShowModal(false);
                        setPromocaoEmEdicao(null);
                    }}
                    onSave={() => {
                        carregarPromocoes();
                        setShowModal(false);
                        setPromocaoEmEdicao(null);
                    }}
                />
            )}
        </div>
    );
};

export default ListaPromocoes;