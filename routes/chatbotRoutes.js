const express = require("express");
const { GoogleGenAI } = require("@google/genai"); // 👈 Nova importação
require("dotenv").config();

const router = express.Router();

// 1. Chave da API do Google Gemini
// Obtenha sua chave no Google AI Studio (antigo MakerSuite)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 2. Modelo Gemini a ser usado
// gemini-2.5-flash é um ótimo modelo rápido e custo-efetivo para chat/tarefas gerais.
const GEMINI_MODEL = "gemini-2.5-flash"; 

// 3. Inicializa o cliente Gemini
// O SDK buscará automaticamente a chave GEMINI_API_KEY do seu .env
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    console.log("⚠️ Requisição sem 'message'");
    return res.status(400).json({ error: "Mensagem é obrigatória" });
  }

  try {
    console.log(`📩 Enviando para Gemini (${GEMINI_MODEL}):`, message);

    // 4. Chamada principal para a API do Gemini
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: message }] }], // Formato de mensagem para o chat
      config: {
        // Opcional: Define a temperatura, limita o tamanho da resposta, etc.
        maxOutputTokens: 200, // Limite de tokens de saída, similar ao max_new_tokens
      },
    });
    
    // O SDK retorna a resposta de forma estruturada.
    const reply = response.text; // 👈 O texto gerado está diretamente na propriedade .text

    console.log("📨 Resposta Gemini:", reply.substring(0, 80) + "..."); // log de um trecho

    res.json({
      reply,
      model: GEMINI_MODEL,
      usage: response.usageMetadata, // Metadados sobre tokens usados (útil para custo)
    });

  } catch (err) {
    console.error("❌ Erro Gemini API:", err);
    res.status(500).json({
      error: "Erro ao se comunicar com a API do Google Gemini",
      details: err.message
    });
  }
});

module.exports = router;