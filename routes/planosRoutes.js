// routes/planosRoutes.js
// API Completa para CRUD de Planos

const express = require("express");
const sql = require("mssql");
const router = express.Router();
const db = require("../config/dbconfig.js");

// 1. Listar todos os planos
router.get("/", async (req, res) => {
<<<<<<< HEAD
   try {
      const pool = await sql.connect(db);
    // Usamos SELECT * para pegar a nova coluna 'Imagem' automaticamente
      const result = await pool.request().query("SELECT * FROM Planos"); 
      res.json(result.recordset);
   } catch (err) {
      console.error("Erro ao buscar planos:", err);
      res.status(500).send("Erro ao buscar planos");
   }
=======
  try {
    const pool = await sql.connect(db);
    // Ordena por ID por padrão
    const result = await pool.request().query("SELECT * FROM Planos ORDER BY IdPlano ASC");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar planos:", err);
    res.status(500).send("Erro ao buscar planos");
  }
>>>>>>> cd0de02dd3711f89f63e9ebd2d0b171804faaa9e
});

// 2. Buscar um plano específico pelo ID
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID do plano é obrigatório' });
      const pool = await sql.connect(db);
      const result = await pool.request()
        .input('IdPlano', sql.Int, id) // <-- IdPlano
        .query('SELECT * FROM Planos WHERE IdPlano = @IdPlano');
      if (result.recordset.length === 0) return res.status(404).json({ error: 'Plano não encontrado' });
      res.json(result.recordset[0]);
    } catch (err) {
      console.error("Erro ao buscar plano por ID:", err);
      res.status(500).send("Erro ao buscar plano");
    }
});

// 3. Adicionar um novo plano
router.post("/", async (req, res) => {
    // Adicionar verificação de admin (middleware) aqui seria ideal
    const { Nome, Descricao, Tipo, Preco, Modalidade, Imagem } = req.body; // Inclui Imagem
    if (!Nome || Preco === undefined || Preco < 0) {
        return res.status(400).json({ error: 'Nome e Preço válido (>= 0) são obrigatórios' });
    }
    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('Nome', sql.NVarChar(150), Nome)
            .input('Descricao', sql.NVarChar(sql.MAX), Descricao || null)
            .input('Tipo', sql.NVarChar(50), Tipo || null)
            .input('Preco', sql.Decimal(10, 2), Preco)
            .input('Modalidade', sql.NVarChar(50), Modalidade || null)
            .input('Imagem', sql.NVarChar(500), Imagem || null) // Campo Imagem adicionado
            .query(`
                INSERT INTO Planos (Nome, Descricao, Tipo, Preco, Modalidade, Imagem)
                OUTPUT INSERTED.*
                VALUES (@Nome, @Descricao, @Tipo, @Preco, @Modalidade, @Imagem);
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Erro ao adicionar plano:", err);
        res.status(500).send("Erro ao adicionar plano");
    }
});

// 4. Atualizar um plano existente
router.put("/:id", async (req, res) => {
    // Adicionar verificação de admin (middleware) aqui seria ideal
    const { id } = req.params;
    const { Nome, Descricao, Tipo, Preco, Modalidade, Imagem } = req.body;
    if (!Nome || Preco === undefined || Preco < 0) {
         return res.status(400).json({ error: 'Nome e Preço válido (>= 0) são obrigatórios.' });
    }
    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('IdPlano', sql.Int, id)
            .input('Nome', sql.NVarChar(150), Nome)
            .input('Descricao', sql.NVarChar(sql.MAX), Descricao || null)
            .input('Tipo', sql.NVarChar(50), Tipo || null)
            .input('Preco', sql.Decimal(10, 2), Preco)
            .input('Modalidade', sql.NVarChar(50), Modalidade || null)
            .input('Imagem', sql.NVarChar(500), Imagem || null)
            .query(`
                UPDATE Planos SET
                    Nome = @Nome, Descricao = @Descricao, Tipo = @Tipo, Preco = @Preco,
                    Modalidade = @Modalidade, Imagem = @Imagem
                OUTPUT INSERTED.*
                WHERE IdPlano = @IdPlano;
            `);
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Plano não encontrado.' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Erro ao atualizar plano:", err);
        res.status(500).send("Erro ao atualizar plano");
    }
});

// 5. Excluir um plano
router.delete("/:id", async (req, res) => {
    // Adicionar verificação de admin (middleware) aqui seria ideal
    const { id } = req.params;
    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('IdPlano', sql.Int, id)
            .query("DELETE FROM Planos WHERE IdPlano = @IdPlano");
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Plano não encontrado.' });
        res.status(204).send(); // Sucesso
    } catch (err) {
        console.error("Erro ao excluir plano:", err);
        res.status(500).send("Erro ao excluir plano");
    }
});

module.exports = router;