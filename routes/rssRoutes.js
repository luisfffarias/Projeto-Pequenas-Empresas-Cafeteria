const express = require('express');
const Parser = require('rss-parser');
const router = express.Router();
const parser = new Parser();

router.get('/feed', async (req, res) => {
  try {
    const feed = await parser.parseURL('https://exemplo.com/feed-cafe.xml');
    res.json(feed.items); // retorna só os itens do feed
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar feed' });
  }
});

module.exports = router;
