import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ListaClientes from './components/clientes/ListaClientes';
import ListaProfissionais from './components/profissionais/ListaProfissionais';
import ListaProdutos from './components/produtos/ListaProdutos';
import ListaPromocoes from './components/promocoes/ListaPromocoes';
import ListaAtendimentos from './components/atendimentos/ListaAtendimentos';
import ListaUsuarios from './components/usuarios/ListaUsuarios';
import Configuracoes from './components/configuracoes/Configuracoes';
import RelatorioComissoes from './components/relatorios/RelatorioComissoes';
import './App.css';

// Componente de proteção de rotas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

// Componente de proteção de rotas apenas para admin
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token) return <Navigate to="/" />;
  if (userType !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/clientes"
          element={
            <PrivateRoute>
              <Layout>
                <ListaClientes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/profissionais"
          element={
            <AdminRoute>
              <Layout>
                <ListaProfissionais />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/dashboard/produtos"
          element={
            <PrivateRoute>
              <Layout>
                <ListaProdutos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/promocoes"
          element={
            <PrivateRoute>
              <Layout>
                <ListaPromocoes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/atendimentos"
          element={
            <PrivateRoute>
              <Layout>
                <ListaAtendimentos />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/usuarios"
          element={
            <AdminRoute>
              <Layout>
                <ListaUsuarios />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/dashboard/configuracoes"
          element={
            <AdminRoute>
              <Layout>
                <Configuracoes />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/dashboard/relatorios/comissoes"
          element={
            <AdminRoute>
              <Layout>
                <RelatorioComissoes />
              </Layout>
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;