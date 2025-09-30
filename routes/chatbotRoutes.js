const express = require('express');
const router = express.Router();

router.post('/chat', (req, res) => {
  const { message } = req.body;

  let resposta = "Não entendi, pode repetir?";

  if (message.toLowerCase().includes("café")) {
    resposta = "O café é uma bebida rica em cafeína que dá energia!";
  } else if (message.toLowerCase().includes("tipos")) {
    resposta = "Existem vários tipos: arábica, robusta, liberica...";
  }

  res.json({ resposta });
});

module.exports = router;
