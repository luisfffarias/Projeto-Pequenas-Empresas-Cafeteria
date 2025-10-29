// routes/cursosRoutes.js
// API Completa para CRUD de Cursos

const express = require("express");
const sql = require("mssql");
const router = express.Router();
const db = require("../config/dbconfig.js");

// 1. Listar todos os cursos
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(db);
    // ALTERADO: Ordena por IdCurso em ordem ascendente (ASC é o padrão, mas explícito é bom)
    const result = await pool.request().query("SELECT * FROM Cursos ORDER BY IdCurso ASC");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar cursos:", err);
    res.status(500).send("Erro ao buscar cursos");
  }
});

// 2. Buscar um curso específico pelo ID
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID do curso é obrigatório' });
      const pool = await sql.connect(db);
      const result = await pool.request()
        .input('IdCurso', sql.Int, id)
        .query('SELECT * FROM Cursos WHERE IdCurso = @IdCurso');
      if (result.recordset.length === 0) return res.status(404).json({ error: 'Curso não encontrado' });
      res.json(result.recordset[0]);
    } catch (err) {
      console.error("Erro ao buscar curso por ID:", err);
      res.status(500).send("Erro ao buscar curso");
    }
});

// 3. Adicionar um novo curso
router.post("/", async (req, res) => {
    // Adicionar verificação de admin (middleware) aqui seria ideal
    const { Nome, DescricaoBasica, DescricaoCompleta, DuracaoHoras, Tipo, Preco, Modalidade, Imagem } = req.body;
    if (!Nome || Preco === undefined || Preco < 0) {
        return res.status(400).json({ error: 'Nome e Preço válido (>= 0) são obrigatórios' });
    }
    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('Nome', sql.NVarChar(150), Nome)
            .input('DescricaoBasica', sql.NVarChar(255), DescricaoBasica || null)
            .input('DescricaoCompleta', sql.NVarChar(sql.MAX), DescricaoCompleta || null)
            .input('DuracaoHoras', sql.Int, DuracaoHoras || null) // Permite nulo
            .input('Tipo', sql.NVarChar(50), Tipo || null)
            .input('Preco', sql.Decimal(10, 2), Preco)
            .input('Modalidade', sql.NVarChar(50), Modalidade || null)
            .input('Imagem', sql.NVarChar(500), Imagem || null)
            .query(`
                INSERT INTO Cursos (Nome, DescricaoBasica, DescricaoCompleta, DuracaoHoras, Tipo, Preco, Modalidade, Imagem)
                OUTPUT INSERTED.*
                VALUES (@Nome, @DescricaoBasica, @DescricaoCompleta, @DuracaoHoras, @Tipo, @Preco, @Modalidade, @Imagem);
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Erro ao adicionar curso:", err);
        res.status(500).send("Erro ao adicionar curso");
    }
});

// 4. Atualizar um curso existente
router.put("/:id", async (req, res) => {
    // Adicionar verificação de admin (middleware) aqui seria ideal
    const { id } = req.params;
    const { Nome, DescricaoBasica, DescricaoCompleta, DuracaoHoras, Tipo, Preco, Modalidade, Imagem } = req.body;
    if (!Nome || Preco === undefined || Preco < 0) {
         return res.status(400).json({ error: 'Nome e Preço válido (>= 0) são obrigatórios para atualização.' });
    }
    // Adicionar mais validações se necessário (ex: DuracaoHoras é número?)

    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('IdCurso', sql.Int, id)
            .input('Nome', sql.NVarChar(150), Nome)
            .input('DescricaoBasica', sql.NVarChar(255), DescricaoBasica || null)
            .input('DescricaoCompleta', sql.NVarChar(sql.MAX), DescricaoCompleta || null)
            .input('DuracaoHoras', sql.Int, DuracaoHoras || null)
            .input('Tipo', sql.NVarChar(50), Tipo || null)
            .input('Preco', sql.Decimal(10, 2), Preco)
            .input('Modalidade', sql.NVarChar(50), Modalidade || null)
            .input('Imagem', sql.NVarChar(500), Imagem || null)
            .query(`
                UPDATE Cursos SET
                    Nome = @Nome, DescricaoBasica = @DescricaoBasica, DescricaoCompleta = @DescricaoCompleta,
                    DuracaoHoras = @DuracaoHoras, Tipo = @Tipo, Preco = @Preco, Modalidade = @Modalidade, Imagem = @Imagem
                OUTPUT INSERTED.*
                WHERE IdCurso = @IdCurso;
            `);
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Curso não encontrado para atualização.' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Erro ao atualizar curso:", err);
        res.status(500).send("Erro ao atualizar curso");
    }
});

// 5. Excluir um curso
router.delete("/:id", async (req, res) => {
    // Adicionar verificação de admin (middleware) aqui seria ideal
    const { id } = req.params;
    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('IdCurso', sql.Int, id)
            .query("DELETE FROM Cursos WHERE IdCurso = @IdCurso");
        if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Curso não encontrado para exclusão.' });
        res.status(204).send(); // Sucesso
    } catch (err) {
        console.error("Erro ao excluir curso:", err);
        res.status(500).send("Erro ao excluir curso");
    }
});


module.exports = router;