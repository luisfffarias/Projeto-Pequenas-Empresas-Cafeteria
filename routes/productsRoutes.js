// routes/productsRoute.js
import express from "express";
import sql from "mssql";
const router = express.Router();
const db = require("../config/dbconfig");

// 🔹 Listar todos os produtos
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(db);
    const result = await pool.request().query("SELECT * FROM Produtos");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    res.status(500).send("Erro ao buscar produtos");
  }
});

// 🔹 Cadastrar novo produto
router.post('/', async (req, res) => {
  try {
    const { nome, descricao, preco, categoria, imagem, estoque } = req.body;

    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('Nome', sql.NVarChar, nome)
      .input('Descricao', sql.NVarChar, descricao || '')
      .input('Preco', sql.Decimal(10, 2), preco)
      .input('Categoria', sql.NVarChar, categoria || '')
      .input('Imagem', sql.NVarChar, imagem || '')
      .input('Estoque', sql.Int, estoque || 0)
      .query(`
        INSERT INTO Produtos (Nome, Descricao, Preco, Categoria, Imagem, Estoque, DataCriacao) 
        VALUES (@Nome, @Descricao, @Preco, @Categoria, @Imagem, @Estoque, GETDATE());
        SELECT * FROM Produtos WHERE IdProduto = SCOPE_IDENTITY();
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao cadastrar produto:", err);
    res.status(500).send("Erro ao cadastrar produto");
  }
});

// 🔹 Atualizar produto existente
router.put('/:id', async (req, res) => {
  try {
    const { nome, descricao, preco, categoria, imagem, estoque } = req.body;
    const productId = req.params.id;

    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const pool = await sql.connect(db);
    
    // Verificar se produto existe
    const checkResult = await pool.request()
      .input('IdProduto', sql.Int, productId)
      .query('SELECT IdProduto FROM Produtos WHERE IdProduto = @IdProduto');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Atualizar produto
    const result = await pool.request()
      .input('IdProduto', sql.Int, productId)
      .input('Nome', sql.NVarChar, nome)
      .input('Descricao', sql.NVarChar, descricao || '')
      .input('Preco', sql.Decimal(10, 2), preco)
      .input('Categoria', sql.NVarChar, categoria || '')
      .input('Imagem', sql.NVarChar, imagem || '')
      .input('Estoque', sql.Int, estoque || 0)
      .query(`
        UPDATE Produtos 
        SET Nome = @Nome, Descricao = @Descricao, Preco = @Preco, 
            Categoria = @Categoria, Imagem = @Imagem, Estoque = @Estoque,
            DataAtualizacao = GETDATE()
        WHERE IdProduto = @IdProduto;
        SELECT * FROM Produtos WHERE IdProduto = @IdProduto;
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    res.status(500).send("Erro ao atualizar produto");
  }
});

export default router;