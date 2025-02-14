import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus } from 'lucide-react';
import api from '../../services/api';
import FormProfissional from './FormProfissional';

const ListaProfissionais = () => {
    const [profissionais, setProfissionais] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [profissionalEmEdicao, setProfissionalEmEdicao] = useState(null);

    // Carregar profissionais
    const carregarProfissionais = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/profissionais');
            setProfissionais(response.data);
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
        profissional.especialidade.toLowerCase().includes(busca.toLowerCase()) ||
        profissional.email.toLowerCase().includes(busca.toLowerCase()) ||
        profissional.fone.includes(busca)
    );

    // Abrir modal para edição
    const handleEditar = (profissional) => {
        setProfissionalEmEdicao(profissional);
        setShowModal(true);
    };

    // Excluir profissional
    const handleExcluir = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este profissional?')) return;

        try {
            await api.delete(`/api/profissionais/${id}`);
            carregarProfissionais();
        } catch (error) {
            setErro(error.response?.data?.message || 'Erro ao excluir profissional');
            console.error(error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Profissionais</h1>
                <button
                    onClick={() => {
                        setProfissionalEmEdicao(null);
                        setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Novo Profissional
                </button>
            </div>

            {/* Barra de busca */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar profissionais..."
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

            {/* Tabela de profissionais */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Especialidade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Telefone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center">
                                    Carregando...
                                </td>
                            </tr>
                        ) : profissionaisFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center">
                                    Nenhum profissional encontrado
                                </td>
                            </tr>
                        ) : (
                            profissionaisFiltrados.map((profissional) => (
                                <tr key={profissional.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {profissional.nome}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {profissional.especialidade}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {profissional.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {profissional.fone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            profissional.usuario_ativo 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {profissional.usuario_ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleEditar(profissional)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleExcluir(profissional.id)}
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
                <FormProfissional
                    profissional={profissionalEmEdicao}
                    onClose={() => {
                        setShowModal(false);
                        setProfissionalEmEdicao(null);
                    }}
                    onSave={() => {
                        carregarProfissionais();
                        setShowModal(false);
                        setProfissionalEmEdicao(null);
                    }}
                />
            )}
        </div>
    );
};

export default ListaProfissionais;