const express = require("express");
const fetch = require("node-fetch"); // certifique-se de ter node-fetch@2
require("dotenv").config();

const router = express.Router();

// Hugging Face API Key
const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;

// Modelo gratuito e funcional
const MODEL = "facebook/blenderbot-400M-distill";

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    console.log("⚠️ Requisição sem 'message'");
    return res.status(400).json({ error: "Mensagem é obrigatória" });
  }

  try {
    console.log("📩 Enviando para Hugging Face:", message);

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: message,
        parameters: { max_new_tokens: 200 }
      }),
    });

    const data = await response.json();

    console.log("📨 Resposta Hugging Face (raw):", JSON.stringify(data, null, 2));

    // Extrair texto gerado
    const reply = data?.generated_text || data?.[0]?.generated_text || "Não foi possível gerar resposta.";

    res.json({
      reply,
      hf_raw: data,            // JSON completo da Hugging Face
      status: response.status, // status HTTP
      statusText: response.statusText
    });

  } catch (err) {
    console.error("❌ Erro Hugging Face:", err);
    res.status(500).json({
      error: "Erro ao se comunicar com Hugging Face",
      details: err.message
    });
  }
});

module.exports = router;
