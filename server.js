const express = require("express");
const path = require("path");
require("dotenv").config();
const connectDB = require("./config/db");

// Rotas existentes
const rssRoutes = require("./routes/rssRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

// Novas rotas da loja
//const productsRoute = require("./routes/productsRoute");
//const shopRoutes = require("./routes/shopRoutes");

const app = express();

// Conecta ao banco
connectDB();

// Middleware para JSON
app.use(express.json());

// ----------------------------------------------------
// Arquivos estáticos
// ----------------------------------------------------
app.use(express.static(path.join(__dirname, "views"))); // HTML
app.use("/assets", express.static(path.join(__dirname, "assets"))); // CSS, JS, imagens

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
// Novas rotas da loja
// ----------------------------------------------------
//app.use("/api/products", productsRoute);
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
