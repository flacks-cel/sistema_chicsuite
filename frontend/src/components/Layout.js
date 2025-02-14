import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users,
    UserCircle,
    Package,
    Calendar,
    BarChart3,
    LogOut,
    Percent,
    Settings,
    UserCog,
    FileText
} from 'lucide-react';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const menuItems = [
        { 
            icon: Calendar, 
            label: 'Atendimentos', 
            path: '/dashboard/atendimentos' 
        },
        { 
            icon: Users, 
            label: 'Clientes', 
            path: '/dashboard/clientes' 
        },
        { 
            icon: UserCircle, 
            label: 'Profissionais', 
            path: '/dashboard/profissionais', 
            adminOnly: true 
        },
        { 
            icon: Package, 
            label: 'Produtos', 
            path: '/dashboard/produtos' 
        },
        { 
            icon: Percent, 
            label: 'Promoções', 
            path: '/dashboard/promocoes' 
        },
        { 
            icon: BarChart3, 
            label: 'Dashboard', 
            path: '/dashboard', 
            adminOnly: true 
        },
        {
            icon: FileText,
            label: 'Comissões',
            path: '/dashboard/relatorios/comissoes',
            adminOnly: true
        },
        { 
            icon: UserCog, 
            label: 'Usuários', 
            path: '/dashboard/usuarios', 
            adminOnly: true 
        },
        { 
            icon: Settings, 
            label: 'Configurações', 
            path: '/dashboard/configuracoes', 
            adminOnly: true 
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Barra lateral */}
            <div className="w-64 bg-white shadow-lg fixed h-full overflow-y-auto flex flex-col">
                <div className="flex flex-col min-h-full">
                    {/* Logo e informações do usuário */}
                    <div className="p-6 border-b shrink-0">
                        <h1 className="text-2xl font-bold text-purple-800">ChicSuite</h1>
                        {userName && (
                            <p className="text-sm text-gray-600 mt-2">
                                Olá, {userName}
                            </p>
                        )}
                    </div>

                    {/* Menu com scroll quando necessário */}
                    <nav className="flex-1 p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {menuItems.map((item, index) => (
                                (!item.adminOnly || userType === 'admin') && (
                                    <li key={index}>
                                        <button
                                            onClick={() => navigate(item.path)}
                                            className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                                                location.pathname === item.path
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5 mr-3" />
                                            {item.label}
                                        </button>
                                    </li>
                                )
                            ))}
                        </ul>
                    </nav>

                    {/* Botão de logout sempre visível no final */}
                    <div className="p-4 border-t mt-auto shrink-0">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sair
                        </button>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div className="ml-64 flex-1 p-6">
                {children}
            </div>
        </div>
    );
};

export default Layout;