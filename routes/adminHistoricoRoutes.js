// routes/adminHistoricoRoutes.js
// API para buscar o Histórico de Compras (para Admin)

const express = require("express");
const sql = require("mssql");
const router = express.Router();
const db = require("../config/dbconfig.js");

// ADMIN 🔹 Listar todo o histórico de compras (com JOIN)
router.get("/", async (req, res) => {
  try {
    // Adicionar verificação de admin (middleware) aqui seria ideal
    const pool = await sql.connect(db);

    // Query com JOIN para buscar nomes de utilizador e produto
    const query = `
            SELECT
                hc.IdCompra,
                hc.DataDaCompra,
                u.Nome AS NomeUsuario,    -- Nome do utilizador da tabela Usuarios
                hc.EmailUsuario,
                p.Nome AS NomeProduto,    -- Nome do produto da tabela Produtos
                hc.IdProduto,
                hc.QuantidadeUnitaria,
                hc.PrecoUnitario,
                hc.PrecoFrete,
                hc.Desconto,
                hc.PrecoTotal             -- Coluna computada
            FROM
                HistoricoDeCompra hc
            INNER JOIN
                Usuarios u ON hc.EmailUsuario = u.Email -- Junta com Usuarios pelo Email
            INNER JOIN
                Produtos p ON hc.IdProduto = p.IdProduto   -- Junta com Produtos pelo IdProduto
            ORDER BY
                hc.DataDaCompra DESC; -- Ordena pelas compras mais recentes primeiro
        `;

    const result = await pool.request().query(query);
    res.json(result.recordset);

  } catch (err) {
    console.error("Erro (Admin) ao buscar histórico de compras:", err);
    // Verifica se o erro é 'Invalid object name' para tabelas relacionadas
    if (err.message.includes("Invalid object name")) {
        // Tenta identificar qual tabela está em falta
        if (err.message.includes("'Usuarios'")) {
             return res.status(500).send("Erro ao buscar histórico: Tabela 'Usuarios' não encontrada ou inacessível.");
        }
        if (err.message.includes("'Produtos'")) {
            return res.status(500).send("Erro ao buscar histórico: Tabela 'Produtos' não encontrada ou inacessível.");
        }
         if (err.message.includes("'HistoricoDeCompra'")) {
            return res.status(500).send("Erro ao buscar histórico: Tabela 'HistoricoDeCompra' não encontrada ou inacessível.");
        }
    }
    res.status(500).send("Erro interno ao buscar histórico de compras");
  }
});

// Poderíamos adicionar mais rotas aqui no futuro, como buscar compras por utilizador, produto ou data.

module.exports = router;