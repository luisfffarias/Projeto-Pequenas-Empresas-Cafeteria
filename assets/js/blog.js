// Sistema Simples de Feed de Notícias - VERSÃO CORRIGIDA
class SimpleBlogFeed {
    constructor() {
        this.currentItems = [];
        this.displayedCount = 0;
        this.itemsPerLoad = 8;
        this.init();
    }

    async init() {
        await this.loadNews();
        this.createLoadMoreButton();
    }

    async loadNews() {
        try {
            // Mostra loading
            this.showLoading();
            
            console.log('Buscando notícias do endpoint...');
            
            // Busca as notícias do seu endpoint - CORREÇÃO DA URL
            const response = await fetch('http://localhost:3000/api/rss/feeds'); // Ajuste a URL conforme necessário
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            console.log('Dados recebidos do endpoint:', data);
            
            // CORREÇÃO PRINCIPAL: Processa os dados corretamente
            if (Array.isArray(data)) {
                // Filtra itens válidos e mapeia para o formato correto
                this.currentItems = data
                    .filter(item => item && item.title) // Filtra itens com título
                    .map(item => ({
                        title: item.title || 'Notícia sobre Café',
                        date: this.formatDate(item.pubDate),
                        link: item.link || '#',
                        image: this.getImageFromItem(item),
                        source: item.source || 'Fonte desconhecida'
                    }));
                
                console.log(`${this.currentItems.length} notícias processadas após filtro`);
                
            } else {
                console.log('Formato de dados inválido - não é array:', data);
                throw new Error('Formato de dados inválido - esperado array');
            }
            
            if (this.currentItems.length === 0) {
                console.log('Nenhuma notícia válida encontrada, usando fallback');
                throw new Error('Nenhuma notícia válida');
            }
            
            console.log(`Total de ${this.currentItems.length} notícias carregadas com sucesso`);
            
            // Mostra as primeiras notícias
            this.showNews();
            
        } catch (error) {
            console.log('Erro ao carregar notícias do endpoint:', error);
            this.showFallbackNews();
        }
    }

    showNews() {
        const container = document.getElementById('blog-container');
        if (!container) {
            console.error('Container #blog-container não encontrado!');
            return;
        }

        // Verifica se há mais itens para mostrar
        if (this.displayedCount >= this.currentItems.length) {
            this.showNoMoreNews();
            return;
        }

        // Pega os próximos itens
        const itemsToShow = this.currentItems.slice(
            this.displayedCount, 
            this.displayedCount + this.itemsPerLoad
        );
        
        console.log(`Mostrando ${itemsToShow.length} notícias (${this.displayedCount}-${this.displayedCount + itemsToShow.length - 1})`);

        // Cria os cards
        const cardsHTML = itemsToShow.map(item => `
            <article class="blog-card">
                <img src="${item.image}" alt="${item.title}" onerror="this.src='../assets/images/blog1.jpg'">
                <div class="blog-info">
                    <div class="blog-meta">
                        <span>${item.date}</span> | <span>${item.source}</span>
                    </div>
                    <h3>${item.title}</h3>
                    <a href="${item.link}" class="blog-btn" target="_blank" rel="noopener">
                        Ler Notícia Original
                    </a>
                </div>
            </article>
        `).join('');

        // Adiciona ao container
        if (this.displayedCount === 0) {
            container.innerHTML = cardsHTML;
        } else {
            container.innerHTML += cardsHTML;
        }

        // Atualiza contador
        this.displayedCount += itemsToShow.length;
        
        // Esconde loading
        this.hideLoading();
        
        // Atualiza estado do botão
        this.updateLoadMoreButton();
        
        console.log(`Total exibido: ${this.displayedCount}/${this.currentItems.length}`);
    }

    loadMoreNews() {
        console.log('Carregando mais notícias...');
        this.showNews();
    }

    showLoading() {
        const container = document.getElementById('blog-container');
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Carregando notícias sobre café...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }

    createLoadMoreButton() {
        // Remove botão existente se houver
        const existingButton = document.querySelector('.load-more-container');
        if (existingButton) {
            existingButton.remove();
        }

        const buttonHTML = `
            <div class="load-more-container">
                <button id="loadMoreBtn" class="load-more-btn">
                    Carregar Mais Notícias
                </button>
            </div>
        `;

        const blogSection = document.querySelector('.blog-section');
        if (blogSection) {
            blogSection.insertAdjacentHTML('beforeend', buttonHTML);
            
            // Adiciona event listener
            document.getElementById('loadMoreBtn').addEventListener('click', () => {
                this.loadMoreNews();
            });
        }
    }

    updateLoadMoreButton() {
        const button = document.getElementById('loadMoreBtn');
        if (!button) return;

        if (this.displayedCount >= this.currentItems.length) {
            this.showNoMoreNews();
        } else {
            const remaining = this.currentItems.length - this.displayedCount;
            const toShow = Math.min(remaining, this.itemsPerLoad);
            button.innerHTML = `Carregar Mais ${toShow} Notícia${toShow > 1 ? 's' : ''}`;
            button.disabled = false;
        }
    }

    showNoMoreNews() {
        const button = document.getElementById('loadMoreBtn');
        if (button) {
            button.innerHTML = '🎉 Todas as notícias carregadas!';
            button.disabled = true;
        }
    }

    showFallbackNews() {
        console.log('Carregando notícias de fallback...');
        
        const fallbackNews = [
            {
                title: 'Novidades do Mercado de Café',
                date: this.formatDate(new Date()),
                link: '#',
                image: '../assets/images/blog1.jpg',
                source: 'Sistema'
            },
            {
                title: 'Tendências do Café Brasileiro',
                date: this.formatDate(new Date()),
                link: '#', 
                image: '../assets/images/blog2.jpg',
                source: 'Sistema'
            },
            {
                title: 'Eventos do Mundo do Café',
                date: this.formatDate(new Date()),
                link: '#',
                image: '../assets/images/blog3.jpg',
                source: 'Sistema'
            },
            {
                title: 'Dicas para Produtores de Café',
                date: this.formatDate(new Date()),
                link: '#',
                image: '../assets/images/blog4.jpg',
                source: 'Sistema'
            },
            {
                title: 'Receitas com Café Especial',
                date: this.formatDate(new Date()),
                link: '#',
                image: '../assets/images/blog5.jpg',
                source: 'Sistema'
            },
            {
                title: 'Curiosidades sobre Café',
                date: this.formatDate(new Date()),
                link: '#',
                image: '../assets/images/blog1.jpg',
                source: 'Sistema'
            },
            {
                title: 'História do Café no Brasil',
                date: this.formatDate(new Date()),
                link: '#',
                image: '../assets/images/blog2.jpg',
                source: 'Sistema'
            },
            {
                title: 'Tipos de Grãos de Café',
                date: this.formatDate(new Date()),
                link: '#',
                image: '../assets/images/blog3.jpg',
                source: 'Sistema'
            }
        ];

        this.currentItems = fallbackNews;
        this.displayedCount = 0;
        this.showNews();
    }

    getImageFromItem(item) {
        // Tenta extrair imagem do item RSS
        if (item.itunes && item.itunes.image) {
            return item.itunes.image;
        }
        if (item.enclosure && item.enclosure.url) {
            return item.enclosure.url;
        }
        
        // Fallback para imagem aleatória
        return this.getRandomImage();
    }

    formatDate(dateString) {
        try {
            if (!dateString) return 'Data não disponível';
            
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Data não disponível';
            }
            
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            console.log('Erro ao formatar data:', dateString, error);
            return 'Data não disponível';
        }
    }

    getRandomImage() {
        const images = [
            '../assets/images/blog1.jpg',
            '../assets/images/blog2.jpg',
            '../assets/images/blog3.jpg', 
            '../assets/images/blog4.jpg',
            '../assets/images/blog5.jpg'
        ];
        return images[Math.floor(Math.random() * images.length)];
    }
}

// Inicializa o sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - inicializando sistema de notícias...');
    window.blogSystem = new SimpleBlogFeed();
});

// Também inicializa se a página for carregada após o DOM estar pronto
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('Página já carregada - inicializando sistema de notícias...');
    window.blogSystem = new SimpleBlogFeed();
}