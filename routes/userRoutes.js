const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const db = require("../config/db");


// ==================== CRIAÇÃO DE USUÁRIO ====================
router.post('/signup', async (req, res) => {
    const { email, senha, nome } = req.body;

    if (!email || !senha || !nome) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        // Cria hash da senha
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // Conecta no banco
        let pool = await sql.connect(dbConfig);

        // Insere usuário
        await pool.request()
            .input('Email', sql.NVarChar, email)
            .input('SenhaHash', sql.NVarChar, senhaHash)
            .input('Nome', sql.NVarChar, nome)
            .query(`INSERT INTO Usuarios (Email, SenhaHash, Nome) VALUES (@Email, @SenhaHash, @Nome)`);

        res.status(201).json({ mensagem: 'Usuário criado com sucesso!' });
    } catch (err) {
        console.error(err);
        if (err.originalError?.info?.number === 2627) { // erro de chave única
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ==================== LOGIN DE USUÁRIO ====================
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    try {
        let pool = await sql.connect(dbConfig);

        // Busca usuário pelo email
        const result = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query(`SELECT * FROM Usuarios WHERE Email = @Email`);

        const usuario = result.recordset[0];

        if (!usuario) {
            return res.status(400).json({ error: 'Usuário ou senha inválidos' });
        }

        // Verifica senha
        const senhaValida = await bcrypt.compare(senha, usuario.SenhaHash);
        if (!senhaValida) {
            return res.status(400).json({ error: 'Usuário ou senha inválidos' });
        }

        // Cria token JWT
        const token = jwt.sign(
            { id: usuario.Id, email: usuario.Email, isAdmin: usuario.IsAdmin },
            'SEU_SEGREDO_JWT',
            { expiresIn: '1h' }
        );

        res.json({ mensagem: 'Login realizado com sucesso!', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
