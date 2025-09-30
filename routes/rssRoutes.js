const express = require('express');
const Parser = require('rss-parser');
const router = express.Router();
const parser = new Parser();

// Rota para pegar o feed de café
router.get('/feed', async (req, res) => {
  try {
    const feed = await parser.parseURL(
      'https://www.noticiasagricolas.com.br/podcasts/cafe-em-prosa.rss'
    );

    // Pega apenas os campos importantes
    const items = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate
    }));

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar feed' });
  }
});

module.exports = router;
