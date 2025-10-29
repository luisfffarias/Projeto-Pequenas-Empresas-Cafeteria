const express = require("express");
const sql = require("mssql");
const dbConfig = require("../config/dbconfig.js");

const router = express.Router();

// 🔹 Montar Carrinho (retorna dados dos produtos com quantidade inicial 1)
router.post("/montar-carrinho", async (req, res) => {
  try {
    const { itens } = req.body; // Ex: [1, 2]

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ carrinho: [], subtotal: 0, frete: 0, total: 0 });
    }

    const pool = await sql.connect(dbConfig);
    const carrinho = [];

    for (const id of itens) {
      const result = await pool
        .request()
        .input("IdProduto", sql.Int, id)
        .query("SELECT * FROM Produtos WHERE IdProduto = @IdProduto");

      if (result.recordset.length > 0) {
        const produto = result.recordset[0];
        carrinho.push({
          id: produto.IdProduto,
          nome: produto.Nome,
          tipo: produto.Tipo,
          preco: produto.Preco,
          quantidade: 1,        // quantidade inicial
          subtotal: produto.Preco
        });
      }
    }

    const subtotal = carrinho.reduce((acc, i) => acc + i.subtotal, 0);
    const frete = carrinho.length > 0 ? 25.0 : 0;
    const total = subtotal + frete;

    res.json({ carrinho, subtotal, frete, total });
  } catch (err) {
    console.error("Erro ao montar carrinho:", err);
    res.status(500).send("Erro ao montar carrinho.");
  }
});

module.exports = router;
