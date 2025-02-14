import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

const FormProduto = ({ produto, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco: '',
        estoque: ''
    });
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (produto) {
            setFormData({
                nome: produto.nome,
                descricao: produto.descricao || '',
                preco: produto.preco.toString(),
                estoque: produto.estoque.toString()
            });
        }
    }, [produto]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Formatação específica para o campo de preço
        if (name === 'preco') {
            // Remove tudo que não é número ou ponto
            const numeroLimpo = value.replace(/[^\d.]/g, '');
            
            // Garante que só há um ponto decimal
            const partes = numeroLimpo.split('.');
            const valorFormatado = partes[0] + (partes[1] ? '.' + partes[1].slice(0, 2) : '');
            
            setFormData(prev => ({
                ...prev,
                [name]: valorFormatado
            }));
            return;
        }

        // Formatação para o campo de estoque (apenas números inteiros)
        if (name === 'estoque') {
            const numeroLimpo = value.replace(/\D/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: numeroLimpo
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validarFormulario = () => {
        if (!formData.nome.trim()) {
            setErro('O nome do produto é obrigatório');
            return false;
        }
        if (!formData.preco || parseFloat(formData.preco) <= 0) {
            setErro('O preço deve ser maior que zero');
            return false;
        }
        if (!formData.estoque || parseInt(formData.estoque) < 0) {
            setErro('O estoque não pode ser negativo');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        setLoading(true);
        setErro('');

        try {
            const dadosParaEnviar = {
                ...formData,
                preco: parseFloat(formData.preco),
                estoque: parseInt(formData.estoque)
            };

            if (produto) {
                // Atualização
                await api.put(`/api/produtos/${produto.id}`, dadosParaEnviar);
            } else {
                // Criação
                await api.post('/api/produtos', dadosParaEnviar);
            }
            
            onSave();
        } catch (error) {
            setErro(error.response?.data?.message || 'Erro ao salvar produto');
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
                        {produto ? 'Editar Produto' : 'Novo Produto'}
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
                                placeholder="Nome do produto"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição
                            </label>
                            <textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24"
                                placeholder="Descrição do produto"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preço (R$)
                            </label>
                            <input
                                type="text"
                                name="preco"
                                value={formData.preco}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estoque
                            </label>
                            <input
                                type="text"
                                name="estoque"
                                value={formData.estoque}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="0"
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

export default FormProduto;