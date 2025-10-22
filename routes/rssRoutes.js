// rssRoutes.js - Versão com conteúdo misturado (curta)
const express = require('express');
const Parser = require('rss-parser');
const router = express.Router();

const parser = new Parser({
    customFields: {
        item: [
            ['itunes:summary', 'itunesSummary'],
            ['itunes:image', 'itunesImage'],
            ['itunes:keywords', 'itunesKeywords'],
            ['content:encoded', 'contentEncoded']
        ]
    }
});

// Rota para múltiplos feeds - CONTEÚDO MISTURADO
router.get('/feeds', async (req, res) => {
    try {
        const feeds = [
            {
                name: 'Café em Prosa',
                url: 'https://www.noticiasagricolas.com.br/podcasts/cafe-em-prosa.rss'
            },
            {
                name: 'Notícias Agrícolas Café',
                url: 'https://uniquecafes.com.br/feed/'
            },
            {
                name: 'CaféPoint',
                url: 'https://www.cecafe.com.br/feed/'
            }
        ];

        const results = await Promise.allSettled(
            feeds.map(feed => parser.parseURL(feed.url))
        );

        const allItems = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.items) {
                const feedItems = result.value.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    content: item.content,
                    contentSnippet: item.contentSnippet,
                    itunes: item.itunes ? {
                        summary: item.itunes.summary,
                        image: item.itunes.image
                    } : null,
                    enclosure: item.enclosure,
                    categories: item.categories,
                    source: feeds[index].name,
                    // Adiciona um peso aleatório para misturar
                    randomWeight: Math.random()
                }));
                
                allItems.push(...feedItems);
            }
        });

        // Mistura os itens: ordena por data E peso aleatório
        allItems.sort((a, b) => {
            const dateA = new Date(a.pubDate);
            const dateB = new Date(b.pubDate);
            
            // Dá prioridade para notícias mais recentes, mas mistura com aleatoriedade
            if (dateB - dateA > 24 * 60 * 60 * 1000) { // Diferença > 1 dia
                return dateB - dateA; // Notícias muito recentes primeiro
            } else {
                return a.randomWeight - b.randomWeight; // Mistura as mais antigas
            }
        });

        res.json(allItems);

    } catch (err) {
        console.error('Erro nos feeds:', err);
        res.status(500).json({ error: 'Erro ao buscar feeds' });
    }
});

module.exports = router;