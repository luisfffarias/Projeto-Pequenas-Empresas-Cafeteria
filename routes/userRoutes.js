const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const db = require("../config/dbconfig");

// ==================== CONFIGURAÇÃO DE TABELAS ====================
const usuarioTable = 'Usuarios';

// ==================== CRIAÇÃO DE USUÁRIO ====================
router.post('/cadastro', async (req, res) => {
    console.log('=== INICIANDO CADASTRO ===');
    console.log('📦 Dados recebidos do frontend:', req.body);
    
    const { email, senha, nome } = req.body;

    if (!email || !senha || !nome) {
        console.log('❌ Campos obrigatórios faltando');
        return res.status(400).json({ 
            success: false,
            error: 'Todos os campos são obrigatórios' 
        });
    }

    let pool;
    try {
        console.log('🔐 1. Criando hash da senha...');
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        console.log('✅ Hash criado');

        console.log('🗄️ 2. Conectando ao banco de dados...');
        console.log('Config DB:', {
            server: db.server,
            database: db.database,
            user: db.user
        });
        
        pool = await sql.connect(db);
        console.log('✅ Conectado ao banco');

        console.log('🔍 3. Verificando se usuário já existe...');
        const checkResult = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query(`SELECT Id FROM ${usuarioTable} WHERE Email = @Email`);
        
        if (checkResult.recordset.length > 0) {
            console.log('❌ Email já cadastrado');
            return res.status(400).json({ 
                success: false, 
                error: 'Email já cadastrado' 
            });
        }
        console.log('✅ Email disponível');

        console.log('📝 4. Inserindo usuário...');
        const insertQuery = `
            INSERT INTO ${usuarioTable} (Email, SenhaHash, Nome, IsAdmin, IsAssinante) 
            VALUES (@Email, @SenhaHash, @Nome, 0, 0)
        `;
        console.log('Query:', insertQuery);

        const insertResult = await pool.request()
            .input('Email', sql.NVarChar, email)
            .input('SenhaHash', sql.NVarChar, senhaHash)
            .input('Nome', sql.NVarChar, nome)
            .query(insertQuery);
        
        console.log('✅ Usuário inserido. Resultado:', insertResult);

        console.log('🔍 5. Buscando usuário criado...');
        const userResult = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query(`SELECT Id, Email, Nome, IsAdmin, IsAssinante FROM ${usuarioTable} WHERE Email = @Email`);

        const usuario = userResult.recordset[0];
        console.log('✅ Usuário encontrado:', usuario);

        if (!usuario) {
            throw new Error('Usuário não encontrado após inserção');
        }

        console.log('🔑 6. Criando token JWT...');
        const token = jwt.sign(
            { 
                id: usuario.Id, 
                email: usuario.Email, 
                isAdmin: usuario.IsAdmin,
                isAssinante: usuario.IsAssinante 
            },
            process.env.JWT_SECRET || 'SEU_SEGREDO_JWT_FALLBACK',
            { expiresIn: '1h' }
        );
        console.log('✅ Token criado');

        console.log('📤 7. Enviando resposta...');
        res.status(201).json({ 
            success: true,
            mensagem: 'Usuário criado com sucesso!',
            user: {
                id: usuario.Id,
                email: usuario.Email,
                nome: usuario.Nome,
                isAdmin: usuario.IsAdmin,
                isAssinante: usuario.IsAssinante
            },
            token 
        });
        console.log('=== CADASTRO CONCLUÍDO COM SUCESSO ===');

    } catch (err) {
        console.log('❌ ERRO NO CADASTRO ==================');
        console.log('Mensagem:', err.message);
        console.log('Nome:', err.name);
        console.log('Código:', err.code);
        console.log('Número:', err.number);
        
        if (err.originalError) {
            console.log('🔍 Detalhes SQL:');
            console.log(' - Mensagem:', err.originalError.message);
            console.log(' - Número:', err.originalError.info?.number);
            console.log(' - Estado:', err.originalError.info?.state);
            console.log(' - Linha:', err.originalError.info?.lineNumber);
        }

        console.log('Stack:', err.stack);

        // Erro de email duplicado
        if (err.number === 2627 || err.originalError?.info?.number === 2627) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email já cadastrado' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } finally {
        // Fechar conexão
        if (pool) {
            try {
                await pool.close();
                console.log('🔒 Conexão fechada');
            } catch (closeErr) {
                console.log('Erro ao fechar conexão:', closeErr.message);
            }
        }
    }
});

// ==================== LOGIN DE USUÁRIO ====================
router.post('/login', async (req, res) => {
    console.log('=== INICIANDO LOGIN ===');
    console.log('📦 Dados recebidos:', { email: req.body.email });
    
    const { email, senha } = req.body;

    if (!email || !senha) {
        console.log('❌ Email ou senha faltando');
        return res.status(400).json({ 
            success: false, 
            error: 'Email e senha são obrigatórios' 
        });
    }

    let pool;
    try {
        console.log('🗄️ Conectando ao banco...');
        pool = await sql.connect(db);
        console.log('✅ Conectado ao banco');

        console.log('🔍 Buscando usuário pelo email...');
        const result = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query(`SELECT * FROM ${usuarioTable} WHERE Email = @Email`);

        console.log(`📊 Resultado da busca: ${result.recordset.length} usuário(s) encontrado(s)`);
        
        const usuario = result.recordset[0];

        if (!usuario) {
            console.log('❌ Usuário não encontrado');
            return res.status(400).json({ 
                success: false, 
                error: 'Usuário ou senha inválidos' 
            });
        }

        console.log('🔐 Verificando senha...');
        const senhaValida = await bcrypt.compare(senha, usuario.SenhaHash);
        console.log(`✅ Senha válida: ${senhaValida}`);

        if (!senhaValida) {
            console.log('❌ Senha inválida');
            return res.status(400).json({ 
                success: false, 
                error: 'Usuário ou senha inválidos' 
            });
        }

        console.log('🔑 Criando token JWT...');
        const token = jwt.sign(
            { id: usuario.Id, email: usuario.Email, isAdmin: usuario.IsAdmin },
            process.env.JWT_SECRET || 'SEU_SEGREDO_JWT_FALLBACK',
            { expiresIn: '1h' }
        );
        console.log('✅ Token JWT criado');

        console.log('📤 Enviando resposta de sucesso');
        res.json({ 
            success: true,
            mensagem: 'Login realizado com sucesso!', 
            user: {
                id: usuario.Id,
                email: usuario.Email,
                nome: usuario.Nome,
                isAdmin: usuario.IsAdmin || false
            },
            token 
        });
        console.log('=== LOGIN CONCLUÍDO COM SUCESSO ===');

    } catch (err) {
        console.log('❌ ERRO NO LOGIN:', err);
        console.log('🔍 Detalhes do erro:', err.message);
        res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    } finally {
        if (pool) {
            try {
                await pool.close();
                console.log('🔒 Conexão fechada');
            } catch (closeErr) {
                console.log('Erro ao fechar conexão:', closeErr.message);
            }
        }
    }
});

// TESTE DE CONEXÃO - Adicione isto no userRoutes.js
async function testarConexaoAtual() {
  try {
    console.log('🔍 TESTANDO CONEXÃO ATUAL...');
    const pool = await sql.connect(db);
    
    // 1. Verificar qual banco estamos
    const dbResult = await pool.request().query('SELECT DB_NAME() as dbname');
    console.log('📊 BANCO CONECTADO:', dbResult.recordset[0].dbname);
    
    // 2. Verificar tabelas
    const tabelas = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log('📋 TABELAS:', tabelas.recordset.map(t => t.TABLE_NAME));
    
    // 3. Testar SELECT na tabela Usuarios
    try {
      const usuarios = await pool.request().query('SELECT COUNT(*) as total FROM Usuarios');
      console.log('✅ SELECT Usuarios FUNCIONOU! Total:', usuarios.recordset[0].total);
    } catch (err) {
      console.log('❌ SELECT Usuarios FALHOU:', err.message);
    }
    
    await pool.close();
  } catch (err) {
    console.log('❌ Erro no teste:', err.message);
  }
}

// Chame esta função uma vez quando o servidor iniciar
testarConexaoAtual();

module.exports = router;