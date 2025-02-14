import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

const FormCliente = ({ cliente, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        fone: ''
    });
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (cliente) {
            setFormData({
                nome: cliente.nome,
                email: cliente.email,
                fone: cliente.fone
            });
        }
    }, [cliente]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            if (cliente) {
                // Atualização
                await api.put(`/api/clientes/${cliente.id}`, formData);
            } else {
                // Criação
                await api.post('/api/clientes', formData);
            }
            
            onSave();
            onClose();
        } catch (error) {
            setErro(error.response?.data?.message || 'Erro ao salvar cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {cliente ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="p-6">
                    {erro && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {erro}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome
                            </label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Nome do cliente"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="email@exemplo.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                name="fone"
                                value={formData.fone}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border text-gray-600 rounded-md hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormCliente;