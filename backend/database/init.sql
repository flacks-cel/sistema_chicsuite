\c chicsuite;

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabelas independentes primeiro
-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_salao VARCHAR(100) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(100),
    percentual_comissao_padrao DECIMAL(5,2) DEFAULT 30.00,
    smtp_host VARCHAR(100),
    smtp_port VARCHAR(10),
    smtp_user VARCHAR(100),
    smtp_pass VARCHAR(100),
    smtp_from VARCHAR(100),
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fone VARCHAR(20) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    estoque INTEGER NOT NULL DEFAULT 0,
    preco DECIMAL(10,2) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Promoções
CREATE TABLE IF NOT EXISTS promocoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    percentual_desconto DECIMAL(5,2) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL
);

-- 2. Tabela base para relacionamentos
-- Tabela de Profissionais
CREATE TABLE IF NOT EXISTS profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    especialidade VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fone VARCHAR(20) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabelas que dependem de profissionais
-- Tabela de Comissões por Profissional
CREATE TABLE IF NOT EXISTS comissoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profissional_id UUID NOT NULL,
    percentual DECIMAL(5,2) NOT NULL,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id),
    CONSTRAINT uq_profissional_comissao UNIQUE (profissional_id)
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profissional_id UUID REFERENCES profissionais(id),
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('admin', 'atendente', 'profissional')),
    ativo BOOLEAN DEFAULT true,
    CONSTRAINT fk_profissional_usuario FOREIGN KEY (profissional_id) REFERENCES profissionais(id)
);

-- 4. Tabelas que dependem de múltiplas outras tabelas
-- Tabela de Atendimentos
CREATE TABLE IF NOT EXISTS atendimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL,
    profissional_id UUID NOT NULL,
    promocao_id UUID,
    servico VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(20) NOT NULL CHECK (forma_pagamento IN ('credito', 'debito', 'pix', 'dinheiro')),
    data_atendimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_criacao UUID NOT NULL,
    valor_comissao DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE 
            WHEN EXISTS (SELECT 1 FROM comissoes c WHERE c.profissional_id = profissional_id)
            THEN preco * (SELECT percentual / 100 FROM comissoes c WHERE c.profissional_id = profissional_id)
            ELSE preco * ((SELECT percentual_comissao_padrao FROM configuracoes LIMIT 1) / 100)
        END
    ) STORED,
    CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_profissional_atendimento FOREIGN KEY (profissional_id) REFERENCES profissionais(id),
    CONSTRAINT fk_promocao FOREIGN KEY (promocao_id) REFERENCES promocoes(id),
    CONSTRAINT fk_usuario_criacao FOREIGN KEY (usuario_criacao) REFERENCES usuarios(id)
);

-- Tabela de Produtos do Atendimento
CREATE TABLE IF NOT EXISTS atendimento_produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    atendimento_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_atendimento FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id),
    CONSTRAINT fk_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- 5. Tabela de auditoria (depende de usuários)
-- Tabela de Auditoria
CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabela VARCHAR(50) NOT NULL,
    operacao VARCHAR(20) NOT NULL,
    registro_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    data_operacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);