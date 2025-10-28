// routes/planosRoutes.js
// API para buscar os planos de assinatura

const express = require("express");
const sql = require("mssql");
const router = express.Router();
const db = require("../config/dbconfig.js"); 

// 🔹 1. Listar todos os planos
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(db);
    // Usamos SELECT * para pegar a nova coluna 'Imagem' automaticamente
    const result = await pool.request().query("SELECT * FROM Planos"); 
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar planos:", err);
    res.status(500).send("Erro ao buscar planos");
  }
});

// 🔹 2. Buscar um plano específico pelo ID
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'ID do plano é obrigatório' });
      }
  
      const pool = await sql.connect(db);
      const result = await pool.request()
        .input('IdPlano', sql.Int, id) // <-- Busca por IdPlano
        .query('SELECT * FROM Planos WHERE IdPlano = @IdPlano');
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Plano não encontrado' });
      }
  
      res.json(result.recordset[0]); // Retorna apenas o objeto
  
    } catch (err) {
      console.error("Erro ao buscar plano por ID:", err);
      res.status(500).send("Erro ao buscar plano");
    }
});

module.exports = router;
