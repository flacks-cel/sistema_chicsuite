import React, { useState, useEffect } from 'react';
import {Search, Edit, Trash2, UserPlus } from 'lucide-react';
import api from '../../services/api';
import FormCliente from './FormCliente';

const ListaClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [clienteEmEdicao, setClienteEmEdicao] = useState(null);

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

    // Abrir modal para edição
    const handleEditar = (cliente) => {
        setClienteEmEdicao(cliente);
        setShowModal(true);
    };

    // Excluir cliente
    const handleExcluir = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;

        try {
            await api.delete(`/api/clientes/${id}`);
            await carregarClientes();
        } catch (error) {
            setErro('Erro ao excluir cliente');
            console.error(error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
                <button
                    onClick={() => {
                        setClienteEmEdicao(null);
                        setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Novo Cliente
                </button>
            </div>

            {/* Barra de busca */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar clientes..."
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

            {/* Tabela de clientes */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Telefone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center">
                                    Carregando...
                                </td>
                            </tr>
                        ) : clientesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center">
                                    Nenhum cliente encontrado
                                </td>
                            </tr>
                        ) : (
                            clientesFiltrados.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {cliente.nome}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {cliente.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {cliente.fone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleEditar(cliente)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleExcluir(cliente.id)}
                                                className="text-red-600 hover:text-red-900"
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
                <FormCliente
                    cliente={clienteEmEdicao}
                    onClose={() => {
                        setShowModal(false);
                        setClienteEmEdicao(null);
                    }}
                    onSave={() => {
                        carregarClientes();
                        setShowModal(false);
                        setClienteEmEdicao(null);
                    }}
                />
            )}
        </div>
    );
};

export default ListaClientes;