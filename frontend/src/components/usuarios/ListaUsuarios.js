import React, { useState, useEffect } from 'react';
import { 
    Search, 
    UserPlus, 
    Edit, 
    Lock,
    Power,
    Shield,
    User,
    UserCog
} from 'lucide-react';
import api from '../../services/api';
import FormUsuario from './FormUsuario';
import FormSenha from './FormSenha';

const ListaUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showSenhaModal, setShowSenhaModal] = useState(false);
    const [usuarioEmEdicao, setUsuarioEmEdicao] = useState(null);
    const [usuarioLogado] = useState(localStorage.getItem('userType'));

    // Carregar usuários
    const carregarUsuarios = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/usuarios');
            setUsuarios(response.data);
            setErro('');
        } catch (error) {
            setErro('Erro ao carregar usuários');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (usuarioLogado === 'admin') {
            carregarUsuarios();
        }
    }, [usuarioLogado]);

    // Filtrar usuários
    const usuariosFiltrados = usuarios.filter(usuario =>
        usuario.usuario.toLowerCase().includes(busca.toLowerCase()) ||
        usuario.profissional_nome?.toLowerCase().includes(busca.toLowerCase()) ||
        usuario.categoria.toLowerCase().includes(busca.toLowerCase())
    );

    // Alternar status (ativar/desativar)
    const handleAlternarStatus = async (id) => {
        try {
            await api.patch(`/api/usuarios/${id}/status`);
            await carregarUsuarios();
        } catch (error) {
            setErro(error.response?.data?.message || 'Erro ao alterar status do usuário');
        }
    };

    // Obter ícone da categoria
    const getCategoriaIcon = (categoria) => {
        switch (categoria) {
            case 'admin':
                return Shield;
            case 'atendente':
                return UserCog;
            case 'profissional':
                return User;
            default:
                return User;
        }
    };

    // Obter cor da categoria
    const getCategoriaColor = (categoria) => {
        switch (categoria) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'atendente':
                return 'bg-blue-100 text-blue-800';
            case 'profissional':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (usuarioLogado !== 'admin') {
        return (
            <div className="p-6">
                <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
                    Acesso restrito. Apenas administradores podem visualizar esta página.
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
                <button
                    onClick={() => {
                        setUsuarioEmEdicao(null);
                        setShowFormModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Novo Usuário
                </button>
            </div>

            {/* Barra de busca */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar usuários..."
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

            {/* Lista de usuários */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-8">
                        Carregando...
                    </div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                        Nenhum usuário encontrado
                    </div>
                ) : (
                    usuariosFiltrados.map((usuario) => {
                        const CategoriaIcon = getCategoriaIcon(usuario.categoria);
                        const categoriaColor = getCategoriaColor(usuario.categoria);

                        return (
                            <div 
                                key={usuario.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {usuario.usuario}
                                            </h3>
                                            {usuario.profissional_nome && (
                                                <p className="text-sm text-gray-500">
                                                    {usuario.profissional_nome}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center ${categoriaColor}`}>
                                            <CategoriaIcon className="w-4 h-4 mr-1" />
                                            {usuario.categoria}
                                        </span>
                                    </div>

                                    <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
                                        <button
                                            onClick={() => {
                                                setUsuarioEmEdicao(usuario);
                                                setShowFormModal(true);
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                            title="Editar"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setUsuarioEmEdicao(usuario);
                                                setShowSenhaModal(true);
                                            }}
                                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                                            title="Alterar Senha"
                                        >
                                            <Lock className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleAlternarStatus(usuario.id)}
                                            className={`p-2 ${
                                                usuario.ativo 
                                                    ? 'text-green-600 hover:bg-green-50' 
                                                    : 'text-red-600 hover:bg-red-50'
                                            } rounded-full`}
                                            title={usuario.ativo ? 'Desativar' : 'Ativar'}
                                        >
                                            <Power className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal de Formulário */}
            {showFormModal && (
                <FormUsuario
                    usuario={usuarioEmEdicao}
                    onClose={() => {
                        setShowFormModal(false);
                        setUsuarioEmEdicao(null);
                    }}
                    onSave={() => {
                        carregarUsuarios();
                        setShowFormModal(false);
                        setUsuarioEmEdicao(null);
                    }}
                />
            )}

            {/* Modal de Alteração de Senha */}
            {showSenhaModal && (
                <FormSenha
                    usuario={usuarioEmEdicao}
                    onClose={() => {
                        setShowSenhaModal(false);
                        setUsuarioEmEdicao(null);
                    }}
                    onSave={() => {
                        setShowSenhaModal(false);
                        setUsuarioEmEdicao(null);
                    }}
                />
            )}
        </div>
    );
};

export default ListaUsuarios;