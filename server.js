const express = require("express");
require("dotenv").config();
const connectDB = require("./config/db");
const rssRoutes = require("./routes/rssRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

connectDB();
app.use(express.json());

app.use("/api/rss", rssRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.get("/", (req, res) => res.send("API funcionando com SQL Server, RSS e Chatbot!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
