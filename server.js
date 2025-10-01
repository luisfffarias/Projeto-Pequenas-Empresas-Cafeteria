const express = require("express");
const path = require("path");
require("dotenv").config();
const connectDB = require("./config/db");
const rssRoutes = require("./routes/rssRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

connectDB();
app.use(express.json());

// ----------------------------------------------------
// Configurações de Arquivos Estáticos (Novas e Existentes)
// ----------------------------------------------------

// 1. Serve arquivos estáticos da pasta 'views' (para os arquivos HTML)
app.use(express.static(path.join(__dirname, 'views'))); 

// 2. NOVO: Serve todos os arquivos da pasta 'assets' sob a rota /assets
// Isso permite que o HTML encontre /assets/css/principal.css, /assets/images, etc.
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ----------------------------------------------------
// Rotas e Inicialização
// ----------------------------------------------------

// Rota GET para servir o arquivo principal.html
app.get('/principal', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'principal.html'));
});

// Suas rotas de API
app.use("/api/rss", rssRoutes);
app.use("/api/chatbot", chatbotRoutes); // Rota do Gemini usada pelo frontend

app.get("/", (req, res) => res.send("API funcionando com SQL Server, RSS e Chatbot!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));