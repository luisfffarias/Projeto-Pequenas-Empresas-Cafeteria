const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ✅ ENDPOINT PARA CLIENTES - CORRIGIDO
router.post("/", async (req, res) => {
  const { message } = req.body;

  console.log("📥 Recebido:", { message });

  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória" });
  }

  try {
    console.log(`📩 Processando: "${message}"`);

    // Usando a nova sintaxe do GoogleGenAI
    const prompt = `Você é um especialista em café artesanal chamado Cafecito. 
Responda de forma amigável, curta e direta em português.

Pergunta: ${message}

Responda:`;

    // ✅ FORMA CORRETA - usando a nova API
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash", // ou "gemini-1.5-flash"
      contents: prompt, // ✅ Diretamente o texto
    });

    console.log("✅ Resposta completa do Gemini:", JSON.stringify(result, null, 2));

    // ✅ EXTRAINDO A RESPOSTA CORRETAMENTE
    let replyText = "Desculpe, não consegui gerar uma resposta.";

    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        replyText = candidate.content.parts[0].text;
      }
    }

    console.log(`🤖 Resposta extraída: "${replyText}"`);

    res.json({
      reply: replyText,
      success: true
    });

  } catch (err) {
    console.error("❌ Erro detalhado:", err);
    
    res.status(500).json({
      error: "Erro interno do servidor",
      details: err.message,
      reply: "Desculpe, estou com problemas técnicos. Tente novamente em alguns instantes."
    });
  }
});

// ✅ ENDPOINT ALTERNATIVO - Método mais simples
router.post("/v2", async (req, res) => {
  const { message } = req.body;

  try {
    console.log(`🔧 V2 - Processando: "${message}"`);

    // Método mais direto
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Você é um barista especialista. Responda em português de forma curta e amigável.

Usuário: ${message}
Barista:`
    });

    console.log("🔧 V2 - Resposta estrutura:", Object.keys(response));
    
    // Tentativa alternativa de extração
    let replyText = "Não entendi sua pergunta sobre café.";
    
    // Método 1: Tentativa padrão
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      replyText = response.candidates[0].content.parts[0].text;
    } 
    // Método 2: Tentativa alternativa
    else if (response.text) {
      replyText = response.text;
    }
    // Método 3: Log para debug
    else {
      console.log("❌ Estrutura não reconhecida:", JSON.stringify(response, null, 2));
    }

    res.json({
      reply: replyText.trim(),
      success: true
    });

  } catch (err) {
    console.error("❌ Erro v2:", err);
    res.status(500).json({
      reply: "Ops! Problema técnico no momento.",
      error: err.message
    });
  }
});

// ✅ ENDPOINT PARA ADMIN
router.post("/admin", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt é obrigatório" });
  }

  try {
    const adminPrompt = `Você é um assistente administrativo para cafeteria.
Responda em português de forma profissional.

Tarefa: ${prompt}

Resposta:`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: adminPrompt,
    });

    let replyText = "Ação administrativa processada.";
    
    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      replyText = result.candidates[0].content.parts[0].text;
    }

    res.json({
      response_text: replyText,
      success: true
    });

  } catch (err) {
    console.error("❌ Erro Admin:", err);
    res.status(500).json({
      error: "Erro no processamento",
      details: err.message
    });
  }
});

// ✅ Rota de saúde
router.get("/health", (req, res) => {
  res.json({ 
    status: "online", 
    message: "Chatbot API funcionando",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;