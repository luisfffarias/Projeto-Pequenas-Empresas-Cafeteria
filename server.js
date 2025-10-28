// server.js (Completo e Corrigido)

const express = require("express");
const path = require("path");
require("dotenv").config();
const connectDB = require("./config/db"); // Presume que este é o seu conector SQL Server

// Rotas existentes
const rssRoutes = require("./routes/rssRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

// Novas rotas da loja
const productsRoute = require("./routes/productsRoutes");
const planosRoutes = require("./routes/planosRoutes");
const cursosRoutes = require("./routes/cursosRoutes");
//const shopRoutes = require("./routes/shopRoutes");

// Novas rotas de usuário
const userRoutes = require("./routes/userRoutes");

const app = express();

// Conecta ao banco
connectDB(); // Garanta que este arquivo (db.js) exporte a função connectDB

// Middleware para JSON
app.use(express.json());

// ----------------------------------------------------
// Arquivos estáticos
// ----------------------------------------------------
app.use(express.static(path.join(__dirname, "views")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// ----------------------------------------------------
// Rotas HTML existentes
// ----------------------------------------------------
app.get("/principal", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "principal.html"));
});

// ----------------------------------------------------
// Rotas da API existentes
// ----------------------------------------------------
app.use("/api/rss", rssRoutes);
app.use("/api/chatbot", chatbotRoutes);

// ----------------------------------------------------
// Novas rotas de usuário
// ----------------------------------------------------
app.use("/api/usuarios", userRoutes);

// ----------------------------------------------------
// Novas rotas da loja
// ----------------------------------------------------
// A URL '/api/produtos' deve bater com a BASE_URL do seu produtos.js (fábrica)
app.use("/api/produtos", productsRoute);
app.use("/api/planos", planosRoutes);
app.use("/api/cursos", cursosRoutes);
//app.use("/api/shop", shopRoutes);

// ----------------------------------------------------
// Rota raiz
// ----------------------------------------------------
app.get("/", (req, res) => {
  res.send("Servidor rodando com SQL Server, RSS, Chatbot e Loja!");
});

// ----------------------------------------------------
// Inicialização do servidor
// ----------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});