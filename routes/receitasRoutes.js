// routes/recipesRoutes.js
// API para buscar as Receitas (nome da tabela corrigido)

const express = require("express");
const sql = require("mssql");
const router = express.Router();
const db = require("../config/dbconfig.js");

// 🔹 1. Listar todas as receitas
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(db);
    // CORRIGIDO: Usa a tabela 'Receitas'
    const result = await pool.request().query("SELECT * FROM Receitas"); 
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar receitas:", err);
    res.status(500).send("Erro ao buscar receitas");
  }
});

// 🔹 2. Buscar uma receita específica pelo ID
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'ID da receita é obrigatório' });
      }
  
      const pool = await sql.connect(db);
      const result = await pool.request()
        .input('IdReceita', sql.Int, id) 
        // CORRIGIDO: Usa a tabela 'Receitas'
        .query('SELECT * FROM Receitas WHERE IdReceita = @IdReceita'); 
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Receita não encontrada' });
      }
  
      res.json(result.recordset[0]); 
  
    } catch (err) {
      console.error("Erro ao buscar receita por ID:", err);
      res.status(500).send("Erro ao buscar receita");
    }
});

module.exports = router;