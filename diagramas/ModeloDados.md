erDiagram
    CLIENTES ||--o{ ATENDIMENTOS : tem
    PROFISSIONAIS ||--o{ ATENDIMENTOS : realiza
    PROFISSIONAIS ||--o{ USUARIOS : possui
    PROFISSIONAIS ||--o{ COMISSOES : recebe
    PROMOCOES ||--o{ ATENDIMENTOS : aplica
    PRODUTOS ||--o{ ATENDIMENTO_PRODUTOS : usado_em
    ATENDIMENTOS ||--o{ ATENDIMENTO_PRODUTOS : contem
    USUARIOS ||--o{ ATENDIMENTOS : registra
    CONFIGURACOES ||--o{ COMISSOES : define_padrao

    CLIENTES {
        UUID id
        string nome
        string email
        string fone
        timestamp data_criacao
    }

    PROFISSIONAIS {
        UUID id
        string nome
        string especialidade
        string email
        string fone
        timestamp data_criacao
    }

    PRODUTOS {
        UUID id
        string nome
        string descricao
        integer estoque
        decimal preco
        timestamp data_criacao
    }

    PROMOCOES {
        UUID id
        string titulo
        string descricao
        decimal percentual_desconto
        date data_inicio
        date data_fim
    }

    USUARIOS {
        UUID id
        UUID profissional_id
        string usuario
        string senha
        string categoria
        boolean ativo
    }

    ATENDIMENTOS {
        UUID id
        UUID cliente_id
        UUID profissional_id
        UUID promocao_id
        string servico
        decimal preco
        string forma_pagamento
        timestamp data_atendimento
        UUID usuario_criacao
        decimal valor_comissao
    }

    ATENDIMENTO_PRODUTOS {
        UUID id
        UUID atendimento_id
        UUID produto_id
        integer quantidade
        decimal preco_unitario
    }

    CONFIGURACOES {
        UUID id
        string nome_salao
        string endereco
        string telefone
        string email
        decimal percentual_comissao_padrao
        string smtp_host
        string smtp_port
        string smtp_user
        string smtp_pass
        string smtp_from
    }

    COMISSOES {
        UUID id
        UUID profissional_id
        decimal percentual
        timestamp data_atualizacao
    }