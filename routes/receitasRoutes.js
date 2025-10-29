// routes/receitasRoutes.js
// API Completa para CRUD de Receitas (usando tabela 'Receitas')

const express = require("express");
const sql = require("mssql");
const router = express.Router();
const db = require("../config/dbconfig.js");

// 1. Listar todas as receitas
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(db);
    // Ordena por ID por padrão
    const result = await pool.request().query("SELECT * FROM Receitas ORDER BY IdReceita ASC");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar receitas:", err);
    res.status(500).send("Erro ao buscar receitas");
  }
});

// 2. Buscar uma receita específica pelo ID
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID da receita é obrigatório' });
      const pool = await sql.connect(db);
      const result = await pool.request()
        .input('IdReceita', sql.Int, id) // <-- IdReceita
        .query('SELECT * FROM Receitas WHERE IdReceita = @IdReceita');
      if (result.recordset.length === 0) return res.status(404).json({ error: 'Receita não encontrada' });
      res.json(result.recordset[0]);
    } catch (err) {
      console.error("Erro ao buscar receita por ID:", err);
      res.status(500).send("Erro ao buscar receita");
    }
});

// 3. Adicionar uma nova receita
router.post("/", async (req, res) => {
    // Adicionar verificação de admin (middleware) aqui seria ideal
    const { Nome, Tipo, Descricao, Ingredientes, ModoPreparo, ImagemURL, Dificuldade, TempoPreparoMin } = req.body;
    // Validação básica
    if (!Nome || !Tipo) {
        return res.status(400).json({ error: 'Nome e Tipo são obrigatórios' });
    }
    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('Nome', sql.NVarChar(200), Nome)
            .input('Tipo', sql.NVarChar(50), Tipo)
            .input('Descricao', sql.NVarChar(sql.MAX), Descricao || null)
            .input('Ingredientes', sql.NVarChar(sql.MAX), Ingredientes || null)
            .input('ModoPreparo', sql.NVarChar(sql.MAX), ModoPreparo || null)
            .input('ImagemURL', sql.NVarChar(500), ImagemURL || null)
            .input('Dificuldade', sql.NVarChar(50), Dificuldade || null)
            .input('TempoPreparoMin', sql.Int, TempoPreparoMin || null)
            .query(`
                INSERT INTO Receitas (Nome, Tipo, Descricao, Ingredientes, ModoPreparo, ImagemURL, Dificuldade, TempoPreparoMin)
                OUTPUT INSERTED.*
                VALUES (@Nome, @Tipo, @Descricao, @Ingredientes, @ModoPreparo, @ImagemURL, @Dificuldade, @TempoPreparoMin);
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Erro ao adicionar receita:", err);
        res.status(500).send("Erro ao adicionar receita");
    }
});

// 4. Atualizar uma receita existente
router.put("/:id", async (req, res) => {
    // Adicionar verificação de admin (middleware) aqui seria ideal
    const { id } = req.params;
    const { Nome, Tipo, Descricao, Ingredientes, ModoPreparo, ImagemURL, Dificuldade, TempoPreparoMin } = req.body;
    if (!Nome || !Tipo) {
         return res.status(400).json({ error: 'Nome e Tipo são obrigatórios.' });
    }
    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('IdReceita', sql.Int, id)
            .input('Nome', sql.NVarChar(200), Nome)
            .input('Tipo', sql.NVarChar(50), Tipo)
            .input('Descricao', sql.NVarChar(sql.MAX), Descricao || null)
            .input('Ingredientes', sql.NVarChar(sql.MAX), Ingredientes || null)
            .input('ModoPreparo', sql.NVarChar(sql.MAX), ModoPreparo || null)
            .input('ImagemURL', sql.NVarChar(500), ImagemURL || null)
            .input('Dificuldade', sql.NVarChar(50), Dificuldade || null)
            .input('TempoPreparoMin', sql.Int, TempoPreparoMin || null)
            .query(`
                UPDATE Receitas SET
                    Nome = @Nome, Tipo = @Tipo, Descricao = @Descricao, Ingredientes = @Ingredientes,
                    ModoPreparo = @ModoPreparo, ImagemURL = @ImagemURL, Dificuldade = @Dificuldade,
                    TempoPreparoMin = @TempoPreparoMin
                OUTPUT INSERTED.*
                WHERE IdReceita = @IdReceita;
            `);
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Receita não encontrada.' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Erro ao atualizar receita:", err);
        res.status(500).send("Erro ao atualizar receita");
    }
});

// 5. Excluir uma receita
router.delete("/:id", async (req, res) => {
    // Adicionar verificação de admin (middleware) aqui seria ideal
    const { id } = req.params;
    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('IdReceita', sql.Int, id)
            .query("DELETE FROM Receitas WHERE IdReceita = @IdReceita");
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Receita não encontrada.' });
        res.status(204).send(); // Sucesso
    } catch (err) {
        console.error("Erro ao excluir receita:", err);
        res.status(500).send("Erro ao excluir receita");
    }
});

module.exports = router;