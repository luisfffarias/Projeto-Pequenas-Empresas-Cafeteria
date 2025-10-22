router.post("/montar-carrinho", async (req, res) => {
  try {
    const { itens } = req.body; // Ex: [1, 2]

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).send("Nenhum item informado.");
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
          quantidade: 1,          // Quantidade padrão
          subtotal: produto.Preco, // Preço x quantidade
        });
      }
    }

    const subtotal = carrinho.reduce((acc, i) => acc + i.subtotal, 0);
    const frete = 25.0;
    const total = subtotal + frete;

    res.json({ carrinho, subtotal, frete, total });
  } catch (err) {
    console.error("Erro ao montar carrinho:", err);
    res.status(500).send("Erro ao montar carrinho.");
  }
});
