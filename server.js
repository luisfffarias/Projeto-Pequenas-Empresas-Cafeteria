const express = require("express");
const path = require("path");
require("dotenv").config();
const connectDB = require("./config/db");

// Rotas existentes
const rssRoutes = require("./routes/rssRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

// Novas rotas da loja
const productsRoute = require("./routes/productsRoutes");
const planosRoutes = require("./routes/planosRoutes");
const cursosRoutes = require("./routes/cursosRoutes");
const receitasRoutes = require("./routes/receitasRoutes");
const shopRoutes = require("./routes/shopRoutes");

// Novas rotas de usuário
const userRoutes = require("./routes/userRoutes");

const app = express();

// ============ MIDDLEWARES ESSENCIAIS ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 MIDDLEWARE CORS - ADICIONE AQUI, DEPOIS DO app = express()
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, X-Requested-With, Accept");
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
// ================================================

// Conecta ao banco
connectDB();

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
app.use("/api/produtos", productsRoute);
app.use("/api/planos", planosRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/receitas", receitasRoutes);
app.use("/api/shop", shopRoutes);

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