import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

const FormPromocao = ({ promocao, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        percentual_desconto: '',
        data_inicio: '',
        data_fim: ''
    });
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (promocao) {
            setFormData({
                titulo: promocao.titulo,
                descricao: promocao.descricao || '',
                percentual_desconto: promocao.percentual_desconto.toString(),
                data_inicio: new Date(promocao.data_inicio).toISOString().split('T')[0],
                data_fim: new Date(promocao.data_fim).toISOString().split('T')[0]
            });
        } else {
            // Se for nova promoção, definir data inicial como hoje
            const hoje = new Date().toISOString().split('T')[0];
            setFormData(prev => ({
                ...prev,
                data_inicio: hoje
            }));
        }
    }, [promocao]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Validação específica para percentual de desconto
        if (name === 'percentual_desconto') {
            // Remove tudo que não é número
            const numeroLimpo = value.replace(/[^\d]/g, '');
            
            // Limita o valor a 100
            const valorFinal = Math.min(parseInt(numeroLimpo || 0), 100);
            
            setFormData(prev => ({
                ...prev,
                [name]: valorFinal.toString()
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validarFormulario = () => {
        // Validar título
        if (!formData.titulo.trim()) {
            setErro('O título da promoção é obrigatório');
            return false;
        }

        // Validar percentual de desconto
        const percentual = parseFloat(formData.percentual_desconto);
        if (isNaN(percentual) || percentual <= 0 || percentual > 100) {
            setErro('O percentual de desconto deve estar entre 0 e 100');
            return false;
        }

        // Validar datas
        const dataInicio = new Date(formData.data_inicio);
        const dataFim = new Date(formData.data_fim);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (dataFim <= dataInicio) {
            setErro('A data final deve ser posterior à data inicial');
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
                percentual_desconto: parseFloat(formData.percentual_desconto)
            };

            if (promocao) {
                // Atualização
                await api.put(`/api/promocoes/${promocao.id}`, dadosParaEnviar);
            } else {
                // Criação
                await api.post('/api/promocoes', dadosParaEnviar);
            }
            
            onSave();
        } catch (error) {
            setErro(error.response?.data?.message || 'Erro ao salvar promoção');
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
                        {promocao ? 'Editar Promoção' : 'Nova Promoção'}
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
                                Título
                            </label>
                            <input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Nome da promoção"
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
                                placeholder="Detalhes da promoção"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Percentual de Desconto (%)
                            </label>
                            <input
                                type="number"
                                name="percentual_desconto"
                                value={formData.percentual_desconto}
                                onChange={handleChange}
                                required
                                min="1"
                                max="100"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="10"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data Início
                                </label>
                                <input
                                    type="date"
                                    name="data_inicio"
                                    value={formData.data_inicio}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data Fim
                                </label>
                                <input
                                    type="date"
                                    name="data_fim"
                                    value={formData.data_fim}
                                    onChange={handleChange}
                                    required
                                    min={formData.data_inicio}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
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

export default FormPromocao;