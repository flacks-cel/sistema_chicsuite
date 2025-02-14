import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

const FormUsuario = ({ usuario, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        profissional_id: null,
        usuario: '',
        senha: '',
        categoria: 'atendente',
        ativo: true
    });
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [profissionais, setProfissionais] = useState([]);
    const [loadingProfissionais, setLoadingProfissionais] = useState(true);

    useEffect(() => {
        const carregarProfissionais = async () => {
            try {
                const response = await api.get('/api/profissionais');
                console.log('Profissionais carregados:', response.data);
                const profissionaisAtivos = response.data.filter(p => p.usuario_ativo !== false);
                setProfissionais(profissionaisAtivos);
            } catch (error) {
                console.error('Erro ao carregar profissionais:', error);
                setErro('Erro ao carregar lista de profissionais');
            } finally {
                setLoadingProfissionais(false);
            }
        };

        carregarProfissionais();
    }, []);

    useEffect(() => {
        if (usuario) {
            setFormData({
                profissional_id: usuario.profissional_id || null,
                usuario: usuario.usuario || '',
                senha: '', // Senha não é carregada na edição
                categoria: usuario.categoria || 'atendente',
                ativo: usuario.ativo !== false
            });
        }
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            // Reset profissional_id when changing category
            ...(name === 'categoria' && value !== 'profissional' ? { profissional_id: null } : {})
        }));
        setErro(''); // Limpa mensagens de erro ao alterar campos
    };

    const validarFormulario = () => {
        if (!formData.usuario?.trim()) {
            setErro('Nome de usuário é obrigatório');
            return false;
        }
        if (formData.usuario.trim().length < 3) {
            setErro('Nome de usuário deve ter pelo menos 3 caracteres');
            return false;
        }
        if (!usuario && !formData.senha) {
            setErro('Senha é obrigatória para novos usuários');
            return false;
        }
        if (!usuario && formData.senha.length < 6) {
            setErro('Senha deve ter pelo menos 6 caracteres');
            return false;
        }
        if (formData.categoria === 'profissional' && !formData.profissional_id) {
            setErro('Selecione um profissional');
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
                profissional_id: formData.categoria === 'profissional' ? formData.profissional_id : null
            };

            // Remove senha vazia na edição
            if (usuario && !dadosParaEnviar.senha) {
                delete dadosParaEnviar.senha;
            }

            console.log('Enviando dados:', {
                ...dadosParaEnviar,
                senha: dadosParaEnviar.senha ? '[PROTEGIDA]' : undefined
            });

            if (usuario) {
                await api.put(`/api/usuarios/${usuario.id}`, dadosParaEnviar);
            } else {
                await api.post('/api/usuarios', dadosParaEnviar);
            }
            
            onSave();
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            setErro(
                error.response?.data?.error || 
                error.response?.data?.message || 
                'Erro ao salvar usuário. Verifique os dados e tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {usuario ? 'Editar Usuário' : 'Novo Usuário'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        type="button"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {erro && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {erro}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome de Usuário
                            </label>
                            <input
                                type="text"
                                name="usuario"
                                value={formData.usuario}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                                minLength={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {usuario ? 'Nova Senha (opcional)' : 'Senha'}
                            </label>
                            <input
                                type="password"
                                name="senha"
                                value={formData.senha}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required={!usuario}
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categoria
                            </label>
                            <select
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            >
                                <option value="atendente">Atendente</option>
                                <option value="profissional">Profissional</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        {formData.categoria === 'profissional' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Profissional
                                </label>
                                {loadingProfissionais ? (
                                    <div className="text-gray-500">Carregando profissionais...</div>
                                ) : (
                                    <select
                                        name="profissional_id"
                                        value={formData.profissional_id || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Selecione um profissional</option>
                                        {profissionais.map(prof => (
                                            <option key={prof.id} value={prof.id}>
                                                {prof.nome} - {prof.especialidade}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {usuario && (
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="ativo"
                                    id="ativo"
                                    checked={formData.ativo}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                                    Usuário Ativo
                                </label>
                            </div>
                        )}
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

export default FormUsuario;