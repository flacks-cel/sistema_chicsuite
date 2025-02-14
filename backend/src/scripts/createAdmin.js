const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const createAdmin = async () => {
    const pool = new Pool({
        user: 'postgres',
        password: 'flacks0102',
        host: 'postgres',
        database: 'chicsuite',
        port: 5432,
    });

    try {
        // Criar profissional admin
        const profResult = await pool.query(`
            INSERT INTO profissionais (id, nome, especialidade, email, fone)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        `, [
            '00000000-0000-0000-0000-000000000000',
            'Administrador',
            'Admin',
            'admin@chicsuite.com',
            '0000000000'
        ]);

        // Criar hash da senha
        const senha = 'admin123';
        const saltRounds = 10;
        const hash = await bcrypt.hash(senha, saltRounds);

        // Criar usuário admin
        await pool.query(`
            INSERT INTO usuarios (profissional_id, usuario, senha, categoria)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (usuario) DO UPDATE
            SET senha = $3
        `, [
            '00000000-0000-0000-0000-000000000000',
            'admin',
            hash,
            'admin'
        ]);

        // Criar configurações iniciais
        await pool.query(`
            INSERT INTO configuracoes (
                nome_salao,
                percentual_comissao_padrao,
                endereco,
                telefone,
                email
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
        `, [
            'ChicSuite',
            30.00,
            'Digite o endereço do salão',
            'Digite o telefone do salão',
            'Digite o email do salão'
        ]);

        console.log('Usuário admin e configurações iniciais criados/atualizados com sucesso!');
    } catch (error) {
        console.error('Erro ao criar usuário admin e configurações:', error);
    } finally {
        await pool.end();
    }
};

createAdmin();