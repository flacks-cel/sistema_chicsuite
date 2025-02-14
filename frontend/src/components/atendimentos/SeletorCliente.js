import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import api from '../../services/api';
import FormCliente from '../clientes/FormCliente';

const SeletorCliente = ({ onSelect, clienteSelecionado }) => {
    const [clientes, setClientes] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showLista, setShowLista] = useState(false);

    // Carregar clientes
    const carregarClientes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/clientes');
            setClientes(response.data);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar clientes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarClientes();
    }, []);

    // Filtrar clientes
    const clientesFiltrados = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.email.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.fone.includes(busca)
    );

    // Selecionar cliente
    const handleSelect = (cliente) => {
        onSelect(cliente);
        setBusca('');
        setShowLista(false);
    };

    // Renderizar cliente selecionado
    const renderClienteSelecionado = () => {
        if (!clienteSelecionado) return null;

        return (
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                <div>
                    <p className="font-medium text-purple-900">{clienteSelecionado.nome}</p>
                    <p className="text-sm text-purple-700">{clienteSelecionado.email}</p>
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
            {clienteSelecionado ? (
                renderClienteSelecionado()
            ) : (
                <div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={busca}
                                onChange={(e) => {
                                    setBusca(e.target.value);
                                    setShowLista(true);
                                }}
                                onFocus={() => setShowLista(true)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Lista de clientes */}
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
                            ) : clientesFiltrados.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    Nenhum cliente encontrado
                                </div>
                            ) : (
                                clientesFiltrados.map((cliente) => (
                                    <button
                                        key={cliente.id}
                                        onClick={() => handleSelect(cliente)}
                                        className="w-full px-4 py-2 text-left hover:bg-purple-50 focus:outline-none focus:bg-purple-50"
                                    >
                                        <p className="font-medium text-gray-800">{cliente.nome}</p>
                                        <p className="text-sm text-gray-500">{cliente.email}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modal de cadastro de cliente */}
            {showModal && (
                <FormCliente
                    onClose={() => setShowModal(false)}
                    onSave={async () => {
                        await carregarClientes();
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default SeletorCliente;