import express from "express";
import sql from "mssql";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM Cursos");
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    res.status(500).send("Erro ao buscar produtos");
  }
});


router.post("/novo", async (req, res) => {
  try {
    const { Nivel, Descricao, DataCurso, DuracaoEmMinutos, Categoria } = req.body;

    // Validação mantida
    if (!Nivel || !Descricao || !DataCurso || !DuracaoEmMinutos || !Categoria) {
      return res.status(400).json({ 
        error: "Todos os campos são obrigatórios" 
      });
    }

    const pool = await sql.connect(dbConfig);
    
    const query = `
      INSERT INTO Cursos (Nivel, Descricao, DataCurso, DuracaoEmMinutos, Categoria) 
      VALUES (@Nivel, @Descricao, @DataCurso, @DuracaoEmMinutos, @Categoria)
    `;
    
    await pool.request()
      .input('Nivel', sql.NVarChar(100), Nivel)
      .input('Descricao', sql.NVarChar(sql.MAX), Descricao)
      .input('DataCurso', sql.DateTime2, DataCurso)
      .input('DuracaoEmMinutos', sql.Int, DuracaoEmMinutos)
      .input('Categoria', sql.NVarChar(150), Categoria)
      .query(query);

    res.status(201).json({ 
      success: true,
      message: "Curso criado com sucesso!",
      data: {
        Nivel,
        Descricao,
        DataCurso,
        DuracaoEmMinutos,
        Categoria
      }
    });
    
  } catch (err) {
    console.error("Erro ao criar curso:", err);
    res.status(500).json({ 
      success: false,
      error: "Erro interno ao criar curso" 
    });
  }
});