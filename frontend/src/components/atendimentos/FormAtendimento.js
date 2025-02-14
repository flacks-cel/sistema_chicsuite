import React, { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';
import api from '../../services/api';
import SeletorCliente from './SeletorCliente';
import SeletorProfissional from './SeletorProfissional';
import SeletorProdutos from './SeletorProdutos';
import SeletorPromocao from './SeletorPromocao';

const FormAtendimento = ({ atendimento, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        cliente_id: '',
        profissional_id: '',
        promocao_id: null,
        servico: '',
        preco: '0',
        forma_pagamento: 'dinheiro',
        produtos: []
    });
    const [cliente, setCliente] = useState(null);
    const [profissional, setProfissional] = useState(null);
    const [promocao, setPromocao] = useState(null);
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [calculandoTotal, setCalculandoTotal] = useState(false);
    const [detalhesCalculo, setDetalhesCalculo] = useState(null);

    // Formas de pagamento disponíveis
    const formasPagamento = [
        { value: 'dinheiro', label: 'Dinheiro' },
        { value: 'credito', label: 'Cartão de Crédito' },
        { value: 'debito', label: 'Cartão de Débito' },
        { value: 'pix', label: 'PIX' }
    ];

    // Carregar dados do atendimento se estiver editando
    useEffect(() => {
        if (atendimento) {
            setFormData({
                cliente_id: atendimento.cliente_id,
                profissional_id: atendimento.profissional_id,
                promocao_id: atendimento.promocao_id,
                servico: atendimento.servico,
                preco: atendimento.preco.toString(),
                forma_pagamento: atendimento.forma_pagamento,
                produtos: atendimento.produtos || []
            });
        }
    }, [atendimento]);

    // Atualizar IDs quando os seletores mudarem
    useEffect(() => {
        if (cliente) {
            setFormData(prev => ({ ...prev, cliente_id: cliente.id }));
        }
    }, [cliente]);

    useEffect(() => {
        if (profissional) {
            setFormData(prev => ({ ...prev, profissional_id: profissional.id }));
        }
    }, [profissional]);

    useEffect(() => {
        if (promocao) {
            setFormData(prev => ({ ...prev, promocao_id: promocao.id }));
        } else {
            setFormData(prev => ({ ...prev, promocao_id: null }));
        }
    }, [promocao]);

    // Calcular total do atendimento
    const calcularTotal = async () => {
        try {
            setCalculandoTotal(true);
            setErro('');

            const response = await api.post('/api/atendimentos/calcular-total', {
                servico: { preco: parseFloat(formData.preco) || 0 },
                produtos: formData.produtos,
                promocao_id: formData.promocao_id
            });

            setFormData(prev => ({ ...prev, preco: response.data.total.toString() }));
            setDetalhesCalculo(response.data.detalhes);
        } catch (error) {
            setErro('Erro ao calcular total');
            console.error(error);
        } finally {
            setCalculandoTotal(false);
        }
    };

    // Atualizar produtos
    const handleProdutosChange = (produtos) => {
        setFormData(prev => ({ ...prev, produtos }));
        // Recalcular total quando mudar os produtos
        calcularTotal();
    };

    // Formatar preço para exibição
    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    // Validar formulário
    const validarFormulario = () => {
        if (!formData.cliente_id) {
            setErro('Selecione um cliente');
            return false;
        }
        if (!formData.profissional_id) {
            setErro('Selecione um profissional');
            return false;
        }
        if (!formData.servico) {
            setErro('Informe o serviço realizado');
            return false;
        }
        if (!formData.preco || parseFloat(formData.preco) <= 0) {
            setErro('Informe um valor válido para o serviço');
            return false;
        }
        return true;
    };

    // Enviar formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        setLoading(true);
        setErro('');

        try {
            if (atendimento) {
                // Atualização
                await api.put(`/api/atendimentos/${atendimento.id}`, formData);
            } else {
                // Criação
                await api.post('/api/atendimentos', formData);
            }
            
            onSave();
        } catch (error) {
            setErro(error.response?.data?.message || 'Erro ao salvar atendimento');
        } finally {
            setLoading(false);
        }
    };

    // Renderizar detalhes do cálculo
    const renderDetalhesCalculo = () => {
        if (!detalhesCalculo) return null;

        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Detalhes do Cálculo</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Serviço:</span>
                        <span>{formatarPreco(detalhesCalculo.servico)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Produtos:</span>
                        <span>{formatarPreco(detalhesCalculo.produtos)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                        <span>Subtotal:</span>
                        <span>{formatarPreco(detalhesCalculo.subtotal)}</span>
                    </div>
                    {detalhesCalculo.desconto > 0 && (
                        <div className="flex justify-between text-red-600">
                            <span>Desconto:</span>
                            <span>-{formatarPreco(detalhesCalculo.desconto)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                        <span>Total:</span>
                        <span>{formatarPreco(formData.preco)}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {atendimento ? 'Editar Atendimento' : 'Novo Atendimento'}
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

                    <div className="space-y-6">
                        {/* Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cliente
                            </label>
                            <SeletorCliente
                                onSelect={setCliente}
                                clienteSelecionado={cliente}
                            />
                        </div>

                        {/* Profissional */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Profissional
                            </label>
                            <SeletorProfissional
                                onSelect={setProfissional}
                                profissionalSelecionado={profissional}
                            />
                        </div>

                        {/* Serviço e Valor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Serviço
                                </label>
                                <input
                                    type="text"
                                    value={formData.servico}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            servico: e.target.value
                                        }));
                                    }}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Ex: Corte de Cabelo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valor do Serviço
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.preco}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                preco: e.target.value
                                            }));
                                        }}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                    <button
                                        type="button"
                                        onClick={calcularTotal}
                                        disabled={calculandoTotal}
                                        className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                                        title="Calcular total"
                                    >
                                        <Calculator className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Produtos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Produtos
                            </label>
                            <SeletorProdutos
                                onSelect={handleProdutosChange}
                                produtosSelecionados={formData.produtos}
                            />
                        </div>

                        {/* Promoção */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Promoção (opcional)
                            </label>
                            <SeletorPromocao
                                onSelect={(novaPromocao) => {
                                    setPromocao(novaPromocao);
                                    // Recalcular total quando mudar a promoção
                                    if (novaPromocao !== promocao) {
                                        setTimeout(calcularTotal, 0);
                                    }
                                }}
                                promocaoSelecionada={promocao}
                            />
                        </div>

                        {/* Detalhes do Cálculo */}
                        {renderDetalhesCalculo()}

                        {/* Forma de Pagamento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Forma de Pagamento
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {formasPagamento.map(({ value, label }) => (
                                    <label
                                        key={value}
                                        className={`
                                            flex items-center justify-center p-2 rounded-lg border cursor-pointer
                                            ${formData.forma_pagamento === value
                                                ? 'bg-purple-50 border-purple-500 text-purple-700'
                                                : 'hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="forma_pagamento"
                                            value={value}
                                            checked={formData.forma_pagamento === value}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                forma_pagamento: e.target.value
                                            }))}
                                            className="hidden"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Botões */}
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

export default FormAtendimento;