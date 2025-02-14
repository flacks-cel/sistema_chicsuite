import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import api from '../../services/api';

const FormSenha = ({ usuario, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        senha_atual: '',
        nova_senha: '',
        confirmar_senha: ''
    });
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validarFormulario = () => {
        // Limpar erro anterior
        setErro('');

        // Validar campos obrigatórios
        if (!formData.senha_atual || !formData.nova_senha || !formData.confirmar_senha) {
            setErro('Todos os campos são obrigatórios');
            return false;
        }

        // Validar se as senhas coincidem
        if (formData.nova_senha !== formData.confirmar_senha) {
            setErro('A nova senha e a confirmação não coincidem');
            return false;
        }

        // Validar tamanho mínimo da senha
        if (formData.nova_senha.length < 6) {
            setErro('A nova senha deve ter pelo menos 6 caracteres');
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
            await api.post(`/api/usuarios/${usuario.id}/senha`, {
                senha_atual: formData.senha_atual,
                nova_senha: formData.nova_senha
            });
            
            onSave();
        } catch (error) {
            setErro(error.response?.data?.message || 'Erro ao alterar senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        Alterar Senha
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
                                Senha Atual
                            </label>
                            <input
                                type="password"
                                name="senha_atual"
                                value={formData.senha_atual}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                name="nova_senha"
                                value={formData.nova_senha}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Nova Senha
                            </label>
                            <input
                                type="password"
                                name="confirmar_senha"
                                value={formData.confirmar_senha}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                                minLength={6}
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
                            {loading ? 'Alterando...' : 'Alterar Senha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormSenha;