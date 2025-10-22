// routes/productsRoute.js
import express from "express";
import sql from "mssql";

const router = express.Router();

const dbConfig = {
  user: "seu_usuario",
  password: "sua_senha",
  server: "localhost",
  database: "CoffeeShop",
  options: { encrypt: false }
};

// 🔹 Listar todos os produtos
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM Produtos");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    res.status(500).send("Erro ao buscar produtos");
  }
});

// 🔹 Buscar produto por ID
router.get("/:id", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("IdProduto", sql.Int, req.params.id)
      .query("SELECT * FROM Produtos WHERE IdProduto = @IdProduto");

    if (result.recordset.length === 0)
      return res.status(404).send("Produto não encontrado");

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    res.status(500).send("Erro ao buscar produto");
  }
});

export default router;
