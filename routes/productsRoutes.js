// routes/productRoutes.js
// VERSÃO COMPLETA E CORRIGIDA (CommonJS) - COM DELETE

const express = require("express");
const sql = require("mssql");
const router = express.Router();
const db = require("../config/dbconfig.js"); // Garanta que este caminho está correto

// 🔹 1. Listar todos os produtos
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

// 🔹 2. Buscar um produto específico pelo ID
router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'ID do produto é obrigatório' });
      }

      const pool = await sql.connect(db);
      const result = await pool.request()
        .input('IdProduto', sql.Int, id)
        .query('SELECT * FROM Produtos WHERE IdProduto = @IdProduto');

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(result.recordset[0]); // Retorna apenas o primeiro (e único) objeto

    } catch (err) {
      console.error("Erro ao buscar produto por ID:", err);
      res.status(500).send("Erro ao buscar produto");
    }
});

// 🔹 3. Cadastrar novo produto
router.post('/', async (req, res) => {
  try {
    const {
        nome, quantidade, origem, intensidade, preco,
        peso, descricao, dataDeValidade, tipo, imagem
    } = req.body;

    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e Preço são obrigatórios' });
    }

    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('Nome', sql.NVarChar(200), nome)
      .input('Quantidade', sql.Int, quantidade || 0)
      .input('Origem', sql.NVarChar(100), origem || null)
      .input('Intensidade', sql.NVarChar(100), intensidade || null)
      .input('Preco', sql.Decimal(10, 2), preco)
      .input('Peso', sql.Decimal(10, 3), peso || null)
      .input('Descricao', sql.NVarChar(sql.MAX), descricao || null)
      .input('DataDeValidade', sql.Date, dataDeValidade || null)
      .input('Tipo', sql.NVarChar(100), tipo || null)
      .input('Imagem', sql.NVarChar(500), imagem || null)
      .query(`
        INSERT INTO Produtos (
            Nome, Quantidade, Origem, Intensidade, Preco, Peso,
            Descricao, DataDeValidade, Tipo, Imagem
        )
        VALUES (
            @Nome, @Quantidade, @Origem, @Intensidade, @Preco, @Peso,
            @Descricao, @DataDeValidade, @Tipo, @Imagem
        );
        SELECT * FROM Produtos WHERE IdProduto = SCOPE_IDENTITY();
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao cadastrar produto:", err);
    res.status(500).send("Erro ao cadastrar produto");
  }
});

// 🔹 4. Atualizar produto existente
router.put('/:id', async (req, res) => {
  try {
    const {
        nome, quantidade, origem, intensidade, preco,
        peso, descricao, dataDeValidade, tipo, imagem
    } = req.body;
    const productId = req.params.id;

    if (!nome || !preco) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const pool = await sql.connect(db);
    const result = await pool.request()
      .input('IdProduto', sql.Int, productId)
      .input('Nome', sql.NVarChar(200), nome)
      .input('Quantidade', sql.Int, quantidade || 0)
      .input('Origem', sql.NVarChar(100), origem || null)
      .input('Intensidade', sql.NVarChar(100), intensidade || null)
      .input('Preco', sql.Decimal(10, 2), preco)
      .input('Peso', sql.Decimal(10, 3), peso || null)
      .input('Descricao', sql.NVarChar(sql.MAX), descricao || null)
      .input('DataDeValidade', sql.Date, dataDeValidade || null)
      .input('Tipo', sql.NVarChar(100), tipo || null)
      .input('Imagem', sql.NVarChar(500), imagem || null)
      .query(`
        UPDATE Produtos
        SET
            Nome = @Nome, Quantidade = @Quantidade, Origem = @Origem,
            Intensidade = @Intensidade, Preco = @Preco, Peso = @Peso,
            Descricao = @Descricao, DataDeValidade = @DataDeValidade,
            Tipo = @Tipo, Imagem = @Imagem
        WHERE IdProduto = @IdProduto;
        SELECT * FROM Produtos WHERE IdProduto = @IdProduto;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    res.status(500).send("Erro ao atualizar produto");
  }
});

// 🔹 5. Atualizar (PATCH) apenas o estoque
router.patch('/:id/estoque', async (req, res) => {
    try {
      const { novaQuantidade } = req.body;
      const { id } = req.params;

      if (novaQuantidade === undefined || typeof novaQuantidade !== 'number' || novaQuantidade < 0) {
        return res.status(400).json({
            error: 'O campo "novaQuantidade" é obrigatório, deve ser um número e não pode ser negativo.'
        });
      }

      const pool = await sql.connect(db);
      const result = await pool.request()
        .input('IdProduto', sql.Int, id)
        .input('Quantidade', sql.Int, novaQuantidade)
        .query(`
          UPDATE Produtos SET Quantidade = @Quantidade
          WHERE IdProduto = @IdProduto;
          SELECT * FROM Produtos WHERE IdProduto = @IdProduto;
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(result.recordset[0]);

    } catch (err) {
      console.error("Erro ao atualizar estoque:", err);
      res.status(500).send("Erro ao atualizar estoque");
    }
});


// 🔹 6. Buscar produtos por nome (semelhante) - Rota existente
router.get('/buscar/:nome', async (req, res) => {
  try {
    const { nome } = req.params;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({ error: "O parâmetro 'nome' é obrigatório" });
    }

    const pool = await sql.connect(db);

    const result = await pool.request()
      .input('Nome', sql.NVarChar(200), `%${nome}%`)
      .query(`
        SELECT *
        FROM Produtos
        WHERE Nome LIKE @Nome
        ORDER BY Nome ASC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Nenhum produto encontrado com esse nome." });
    }

    res.json(result.recordset);

  } catch (err) {
    console.error("Erro ao buscar produtos por nome:", err);
    res.status(500).send("Erro ao buscar produtos por nome");
  }
});

// 🔹 7. Excluir um produto (ESTAVA EM FALTA)
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(db);
        const result = await pool.request()
            .input('IdProduto', sql.Int, id)
            .query("DELETE FROM Produtos WHERE IdProduto = @IdProduto");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Produto não encontrado para exclusão.' });
        }
        res.status(204).send(); // Sucesso sem conteúdo
    } catch (err) {
        console.error("Erro ao excluir produto:", err);
        res.status(500).send("Erro ao excluir produto");
    }
});

// Exporta o router para o server.js
module.exports = router;