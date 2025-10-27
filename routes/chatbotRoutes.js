const express = require("express");
require("dotenv").config();

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ======================================================
// ✅ Modelo LangChain com streaming
// ======================================================
const langchainModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: GEMINI_API_KEY,
  temperature: 0.1,
  maxOutputTokens: 512,
  streaming: true, // versão streaming
});

// ======================================================
// ✅ Memory simples por sessão
// ======================================================
const memories = new Map();

function getMemory(sessionId = "default") {
  if (!memories.has(sessionId)) memories.set(sessionId, []);
  return memories.get(sessionId);
}

function formatHistory(messages) {
  if (!messages || messages.length === 0) return "";
  return messages.map(msg => `${msg.role}: ${msg.content}`).join("\n");
}

// ======================================================
// ✅ Endpoint único para chat (clientes ou admin)
// ======================================================
router.post("/", async (req, res) => {
  const { message, sessionId = "default" } = req.body;
  if (!message) return res.status(400).json({ error: "Mensagem é obrigatória" });

  try {
    const memory = getMemory(sessionId);
    const history = formatHistory(memory);

    const promptTemplate = PromptTemplate.fromTemplate(`
Você é um assistente Cafecito.
Responda de forma amigável, curta e direta em português.

Histórico da conversa:
{history}

Pergunta atual: {input}
Responda:
`);

    const chain = RunnableSequence.from([
      promptTemplate,
      langchainModel,
      new StringOutputParser(),
    ]);

    const replyText = await chain.invoke({ history, input: message });

    // Salvar no memory
    memory.push({ role: "user", content: message });
    memory.push({ role: "assistant", content: replyText });

    if (memory.length > 10) memory.splice(0, 2); // limita histórico

    res.json({ reply: replyText, success: true });
  } catch (err) {
    console.error("❌ Erro Chatbot:", err);
    res.status(500).json({
      error: "Erro no processamento",
      details: err.message,
    });
  }
});

// ======================================================
// ✅ Endpoints para gerenciamento de memory
// ======================================================
router.post("/clear-memory", (req, res) => {
  const { sessionId = "default" } = req.body;
  memories.delete(sessionId);
  res.json({ success: true, message: "Memory limpa" });
});

router.get("/memory/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const memory = getMemory(sessionId);
  res.json({ sessionId, memory, history: formatHistory(memory) });
});

// ======================================================
// ✅ Health Check
// ======================================================
router.get("/health", (req, res) => {
  res.json({
    status: "online",
    message: "Chatbot API com LangChain + Gemini Streaming",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
