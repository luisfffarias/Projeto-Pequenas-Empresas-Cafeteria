// assets/js/planos.js
import planosFactory from './planosFactory.js'; 

const container = document.getElementById('planos-container');
const loadingMessage = document.getElementById('loading-message-planos');

document.addEventListener('DOMContentLoaded', async () => {
    const planos = await planosFactory.getTodosPlanos();

    if (planos.length === 0) {
        loadingMessage.innerText = 'Falha ao carregar planos. Tente novamente mais tarde.';
        return;
    }
    
    loadingMessage.style.display = 'none';
    renderizarPlanos(planos);
});

function renderizarPlanos(planos) {
    container.innerHTML = ''; 

    planos.forEach(plano => {
        const card = document.createElement('div');
        card.className = 'plano-card';
        
        const precoFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(plano.Preco);
        
        const tipoPreco = plano.Tipo === 'Anual' ? '/ano' : '/mês';
        const tipoClass = `tipo-${plano.Tipo.toLowerCase()}`;
        const modalidadeClass = `modalidade-${plano.Modalidade.toLowerCase()}`;
        const imagemSrc = plano.Imagem || '../assets/images/cafe-placeholder.jpg'; 

        if (plano.Tipo === 'Anual') {
            card.classList.add('plano-destaque');
        }

        // HTML do Card com links para a página de detalhe
        card.innerHTML = `
            <a href="plano-detalhe.html?id=${plano.IdPlano}" class="plano-link-imagem">
                <img src="${imagemSrc}" alt="${plano.Nome}">
            </a>
            
            <div class="plano-card-content">
                <a href="plano-detalhe.html?id=${plano.IdPlano}" class="plano-link-titulo">
                    <h3>${plano.Nome}</h3>
                </a>
                
                <div class="plano-preco">${precoFormatado} <span>${tipoPreco}</span></div>
                
                <div class="plano-tags">
                    <span class="plano-tag ${tipoClass}">${plano.Tipo}</span>
                    <span class="plano-tag ${modalidadeClass}">${plano.Modalidade}</span>
                </div>

                <p class="plano-descricao">${plano.Descricao}</p>
                
                <a href="#" class="plano-btn-assinar" data-id="${plano.IdPlano}">
                    Assinar Agora
                </a>
            </div>
        `;
        
        container.appendChild(card);
        
        // Listener do botão "Assinar" (separado para evitar links)
        card.querySelector('.plano-btn-assinar').addEventListener('click', (e) => {
            e.preventDefault(); // Impede o link de navegar
            e.stopPropagation(); // Impede o clique de "borbulhar" para os links do card
            const id = e.currentTarget.dataset.id;
            console.log("Iniciando assinatura do plano ID:", id);
            alert("Iniciando processo de assinatura! (Lógica pendente)");
        });
    });
}