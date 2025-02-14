import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import api from '../../services/api';

const SeletorProfissional = ({ onSelect, profissionalSelecionado }) => {
    const [profissionais, setProfissionais] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [showLista, setShowLista] = useState(false);

    // Carregar profissionais
    const carregarProfissionais = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/profissionais');
            // Filtrar apenas profissionais ativos
            const profissionaisAtivos = response.data.filter(p => p.usuario_ativo !== false);
            setProfissionais(profissionaisAtivos);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar profissionais');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarProfissionais();
    }, []);

    // Filtrar profissionais
    const profissionaisFiltrados = profissionais.filter(profissional =>
        profissional.nome.toLowerCase().includes(busca.toLowerCase()) ||
        profissional.especialidade.toLowerCase().includes(busca.toLowerCase())
    );

    // Selecionar profissional
    const handleSelect = (profissional) => {
        onSelect(profissional);
        setBusca('');
        setShowLista(false);
    };

    // Renderizar profissional selecionado
    const renderProfissionalSelecionado = () => {
        if (!profissionalSelecionado) return null;

        return (
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                <div>
                    <p className="font-medium text-purple-900">{profissionalSelecionado.nome}</p>
                    <p className="text-sm text-purple-700">{profissionalSelecionado.especialidade}</p>
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
            {profissionalSelecionado ? (
                renderProfissionalSelecionado()
            ) : (
                <div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar profissional..."
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setShowLista(true);
                            }}
                            onFocus={() => setShowLista(true)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Lista de profissionais */}
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
                            ) : profissionaisFiltrados.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    Nenhum profissional encontrado
                                </div>
                            ) : (
                                profissionaisFiltrados.map((profissional) => (
                                    <button
                                        key={profissional.id}
                                        onClick={() => handleSelect(profissional)}
                                        className="w-full px-4 py-2 text-left hover:bg-purple-50 focus:outline-none focus:bg-purple-50"
                                    >
                                        <p className="font-medium text-gray-800">{profissional.nome}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-500">
                                                {profissional.especialidade}
                                            </p>
                                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                                {profissional.usuario_categoria || 'Profissional'}
                                            </span>
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

export default SeletorProfissional;