// routes/adminUserRoutes.js
// API **EXCLUSIVA** para Administração de Usuários

const express = require("express");
const sql = require("mssql");
const router = express.Router();
const db = require("../config/dbconfig.js");
// const bcrypt = require('bcrypt'); // Lembre-se do hashing

// ADMIN 🔹 1. Listar todos os usuários (exceto senha hash)
router.get("/", async (req, res) => {
  try {
  	// Adicionar verificação de admin aqui seria ideal (middleware)
  	const pool = await sql.connect(db);
  	const result = await pool.request().query("SELECT Id, Email, Nome, IsAdmin, IsAssinante FROM Usuarios ORDER BY Nome");
  	res.json(result.recordset);
  } catch (err) {
  	console.error("Erro (Admin) ao buscar usuários:", err);
  	res.status(500).send("Erro ao buscar usuários");
  }
});

// ADMIN 🔹 2. Buscar um usuário específico pelo ID (exceto senha hash)
router.get("/:id", async (req, res) => {
    try {
        // Adicionar verificação de admin aqui seria ideal (middleware)
        const { id } = req.params;
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query("SELECT Id, Email, Nome, IsAdmin, IsAssinante FROM Usuarios WHERE Id = @Id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Erro (Admin) ao buscar usuário por ID:", err);
        res.status(500).send("Erro ao buscar usuário");
    }
});

// ADMIN 🔹 3. Adicionar um novo usuário (pelo admin)
router.post("/", async (req, res) => {
    // Adicionar verificação de admin aqui seria ideal (middleware)
    const { Email, Senha, Nome, IsAdmin, IsAssinante } = req.body;
    if (!Email || !Senha || !Nome) {
        return res.status(400).json({ error: 'Email, Senha e Nome são obrigatórios' });
    }
    try {
        // --- LÓGICA DE HASHING DE SENHA (Exemplo com bcrypt) ---
        // const saltRounds = 10;
        // const senhaHashGerada = await bcrypt.hash(Senha, saltRounds);
        // --------------------------------------------------------
        const senhaHashParaSalvar = Senha; // <- !! PLACEHOLDER !! Use o hash real!

        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('Email', sql.NVarChar(255), Email)
            .input('SenhaHash', sql.NVarChar(255), senhaHashParaSalvar)
            .input('Nome', sql.NVarChar(150), Nome)
            .input('IsAdmin', sql.Bit, IsAdmin || 0)
            .input('IsAssinante', sql.Bit, IsAssinante || 0)
            .query(`
                INSERT INTO Usuarios (Email, SenhaHash, Nome, IsAdmin, IsAssinante)
                OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.Nome, INSERTED.IsAdmin, INSERTED.IsAssinante
                VALUES (@Email, @SenhaHash, @Nome, @IsAdmin, @IsAssinante);
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        if (err.number === 2627 || err.message.includes('UNIQUE KEY')) {
             return res.status(409).json({ error: 'Este email já está cadastrado.' });
        }
        console.error("Erro (Admin) ao adicionar usuário:", err);
        res.status(500).send("Erro ao adicionar usuário");
    }
});

// ADMIN 🔹 4. Atualizar informações básicas (Nome, IsAdmin, IsAssinante)
router.put("/:id", async (req, res) => {
    // Adicionar verificação de admin aqui seria ideal (middleware)
    const { id } = req.params;
    const { Nome, IsAdmin, IsAssinante } = req.body;
    if (!Nome) return res.status(400).json({ error: 'O Nome é obrigatório.' });
    if (IsAdmin !== undefined && ![0, 1, true, false].includes(IsAdmin)) return res.status(400).json({ error: 'Valor inválido para IsAdmin.' });
    if (IsAssinante !== undefined && ![0, 1, true, false].includes(IsAssinante)) return res.status(400).json({ error: 'Valor inválido para IsAssinante.' });

    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .input('Nome', sql.NVarChar(150), Nome)
            .input('IsAdmin', sql.Bit, IsAdmin)
            .input('IsAssinante', sql.Bit, IsAssinante)
            .query(`
                UPDATE Usuarios SET Nome = @Nome, IsAdmin = ISNULL(@IsAdmin, IsAdmin), IsAssinante = ISNULL(@IsAssinante, IsAssinante)
                OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.Nome, INSERTED.IsAdmin, INSERTED.IsAssinante
                WHERE Id = @Id;
            `);
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Erro (Admin) ao atualizar usuário:", err);
        res.status(500).send("Erro ao atualizar usuário");
    }
});

// ADMIN 🔹 5. Bloquear/Desbloquear (se adicionar a coluna 'IsBloqueado')
/*
router.patch("/:id/status", async (req, res) => {
    // Adicionar verificação de admin aqui seria ideal (middleware)
    const { id } = req.params;
    const { isBloqueado } = req.body;
    if (isBloqueado === undefined || ![0, 1, true, false].includes(isBloqueado)) {
        return res.status(400).json({ error: 'O campo "isBloqueado" (0 ou 1) é obrigatório.' });
    }
    try {
        // ... (código SQL UPDATE IsBloqueado) ...
    } catch (err) {
        // ... (tratamento de erro) ...
    }
});
*/

// ADMIN 🔹 6. Excluir um usuário
router.delete("/:id", async (req, res) => {
    // Adicionar verificação de admin aqui seria ideal (middleware)
    const { id } = req.params;
    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query("DELETE FROM Usuarios WHERE Id = @Id");
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
        res.status(204).send();
    } catch (err) {
        console.error("Erro (Admin) ao excluir usuário:", err);
        res.status(500).send("Erro ao excluir usuário");
    }
});

module.exports = router;