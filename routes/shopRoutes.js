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

// Endpoint para finalizar compra - CORRIGIDO
// Endpoint CORRIGIDO para finalizar compra
router.post("/comprar", async (req, res) => {
    console.log("🎯 ENDPOINT /comprar CHAMADO!");
    
    try {
        const {
            emailUsuario,
            itens,
            enderecoEntrega,
            valor,
            metodoPagamento
        } = req.body;

        console.log("📊 Dados recebidos:");
        console.log("- Email:", emailUsuario);
        console.log("- Itens:", itens);
        console.log("- CEP:", enderecoEntrega?.cep);
        console.log("- Subtotal:", valor?.subtotal);
        console.log("- Frete:", valor?.frete);
        console.log("- Total:", valor?.total);
        console.log("- Método:", metodoPagamento);

        // Conectar ao banco
        const pool = await sql.connect(dbConfig);
        console.log("✅ Conectado ao banco");
        
        // CORREÇÃO: Remover PrecoTotal do INSERT (é computado automaticamente)
        const insertQuery = `
            INSERT INTO HistoricoDeCompra (
                EmailUsuario, Subtotal, PrecoFrete, Desconto,
                MetodoPagamento, CepEntrega, DataDaCompra, StatusCompra
            ) 
            OUTPUT INSERTED.IdCompra
            VALUES (@emailUsuario, @subtotal, @frete, @desconto, 
                    @metodoPagamento, @cep, GETDATE(), 'pendente')
        `;

        console.log("📝 Inserindo no banco...");
        const result = await pool.request()
            .input('emailUsuario', sql.NVarChar(255), emailUsuario)
            .input('subtotal', sql.Decimal(10, 2), valor?.subtotal || 0)
            .input('frete', sql.Decimal(10, 2), valor?.frete || 0)
            .input('desconto', sql.Decimal(10, 2), 0) // Desconto fixo em 0
            .input('metodoPagamento', sql.NVarChar(50), metodoPagamento)
            .input('cep', sql.NVarChar(10), enderecoEntrega?.cep || '')
            .query(insertQuery);

        const idCompra = result.recordset[0].IdCompra;
        console.log("✅ Compra salva! ID:", idCompra);

        await pool.close();

        // 🔥 GARANTIR que retorna como JSON
        res.json({
            success: true,
            idCompra: idCompra,
            message: "Compra finalizada com sucesso!"
        });

    } catch (error) {
        console.error("❌ Erro:", error);
        // 🔥 GARANTIR que retorna como JSON mesmo no erro
        res.status(500).json({
            success: false,
            message: "Erro: " + error.message
        });
    }
});

module.exports = router;