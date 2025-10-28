// routes/cursosRoutes.js
// API para buscar os Cursos

const express = require("express");
const sql = require("mssql");
const router = express.Router();
const db = require("../config/dbconfig.js");

// 🔹 1. Listar todos os cursos
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const result = await pool.request().query("SELECT * FROM Cursos");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar cursos:", err);
    res.status(500).send("Erro ao buscar cursos");
  }
});

// 🔹 2. Buscar um curso específico pelo ID
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'ID do curso é obrigatório' });
      }
  
      const pool = await sql.connect(db);
      const result = await pool.request()
        .input('IdCurso', sql.Int, id) // <-- Cuidado: IdCurso
        .query('SELECT * FROM Cursos WHERE IdCurso = @IdCurso');
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }
  
      res.json(result.recordset[0]); // Retorna apenas o objeto
  
    } catch (err) {
      console.error("Erro ao buscar curso por ID:", err);
      res.status(500).send("Erro ao buscar curso");
    }
});

module.exports = router;