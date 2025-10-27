// assets/js/catalogo.js

// LINHA 1: Corrigida para importar 'produtos.js' e usar a variável 'productFactory'
import productFactory from './produtos.js';

// Variável global para guardar todos os produtos e não precisar buscar na API toda hora
let todosOsProdutos = [];
let filtrosAtivos = {
    tipo: [],
    origem: [],
    intensidade: []
};

// Elementos do DOM
const gridContainer = document.getElementById('produtos-grid-container');
const loadingMessage = document.getElementById('loading-message');
const filtroTipoContainer = document.getElementById('filtro-tipo');
const filtroOrigemContainer = document.getElementById('filtro-origem');
const filtroIntensidadeContainer = document.getElementById('filtro-intensidade');

/**
 * Função principal, executada quando a página carrega
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Busca os produtos da API (usando a variável 'productFactory' corrigida)
    todosOsProdutos = await productFactory.getTodosProdutos();
    
    // 2. Se a busca falhar, exibe mensagem de erro
    if (todosOsProdutos.length === 0) {
        loadingMessage.innerText = 'Falha ao carregar produtos. Tente novamente mais tarde.';
        return;
    }
    
    // 3. Remove a mensagem "Carregando..."
    loadingMessage.style.display = 'none';

    // 4. Cria os filtros e os produtos na tela
    gerarFiltrosDinamicos();
    renderizarProdutos(todosOsProdutos);
});

/**
 * Pega a lista completa de produtos e cria os filtros de checkbox dinamicamente
 */
function gerarFiltrosDinamicos() {
    // Extrai valores únicos para cada filtro, ignorando nulos ou vazios
    const tipos = [...new Set(todosOsProdutos.map(p => p.Tipo).filter(Boolean))];
    const origens = [...new Set(todosOsProdutos.map(p => p.Origem).filter(Boolean))];
    const intensidades = [...new Set(todosOsProdutos.map(p => p.Intensidade).filter(Boolean))];

    // Função auxiliar para criar os checkboxes
    const criarCheckboxes = (container, listaItens, grupoFiltro) => {
        listaItens.sort().forEach(item => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = item;
            input.dataset.grupo = grupoFiltro; // Para saber qual filtro é (tipo, origem...)
            
            // Adiciona o listener de evento
            input.addEventListener('change', aplicarFiltros);

            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${item}`));
            container.appendChild(label);
        });
    };

    // Cria os checkboxes para cada grupo
    criarCheckboxes(filtroTipoContainer, tipos, 'tipo');
    criarCheckboxes(filtroOrigemContainer, origens, 'origem');
    criarCheckboxes(filtroIntensidadeContainer, intensidades, 'intensidade');
}


/**
 * Chamado toda vez que um checkbox de filtro é clicado
 */
function aplicarFiltros() {
    // 1. Atualiza o objeto 'filtrosAtivos'
    filtrosAtivos = {
        tipo: [],
        origem: [],
        intensidade: []
    };

    // Seleciona todos os checkboxes marcados
    const checkboxesMarcados = document.querySelectorAll('.filtro-grupo input[type="checkbox"]:checked');
    
    checkboxesMarcados.forEach(check => {
        const grupo = check.dataset.grupo; // 'tipo', 'origem' ou 'intensidade'
        const valor = check.value;
        if (filtrosAtivos[grupo]) {
            filtrosAtivos[grupo].push(valor);
        }
    });

    // 2. Filtra a lista 'todosOsProdutos'
    let produtosFiltrados = todosOsProdutos.filter(produto => {
        const passaTipo = filtrosAtivos.tipo.length === 0 || filtrosAtivos.tipo.includes(produto.Tipo);
        const passaOrigem = filtrosAtivos.origem.length === 0 || filtrosAtivos.origem.includes(produto.Origem);
        const passaIntensidade = filtrosAtivos.intensidade.length === 0 || filtrosAtivos.intensidade.includes(produto.Intensidade);

        return passaTipo && passaOrigem && passaIntensidade;
    });

    // 3. Renderiza os produtos filtrados
    renderizarProdutos(produtosFiltrados);
}


// ... (resto do catalogo.js)

/**
 * Recebe uma lista de produtos e os desenha na tela
 * @param {Array} produtos - A lista de produtos a ser exibida
 */
function renderizarProdutos(produtos) {
    // 1. Limpa o grid atual
    gridContainer.innerHTML = '';

    // 2. Se a lista estiver vazia... (código existente)
    if (produtos.length === 0) {
        gridContainer.innerHTML = '<p class="nenhum-produto">Nenhum produto encontrado com estes filtros.</p>';
        return;
    }

    // 3. Cria um card para cada produto
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.dataset.idProduto = produto.IdProduto; 

        const precoFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(produto.Preco);

        const imagemSrc = produto.Imagem || '../assets/images/cafe-placeholder.jpg';
        const tags = [produto.Tipo, produto.Intensidade].filter(Boolean).join(' | ');

        // --- INÍCIO DA MUDANÇA ---
        // Agora, a imagem e o título são links para a página de detalhe
        card.innerHTML = `
            <a href="produto.html?id=${produto.IdProduto}" class="produto-link-imagem">
                <img src="${imagemSrc}" alt="${produto.Nome}">
            </a>
            <div class="produto-info">
                ${tags ? `<span class="produto-tag">${tags}</span>` : ''}
                
                <a href="produto.html?id=${produto.IdProduto}" class="produto-link-titulo">
                    <h3>${produto.Nome}</h3>
                </a>
                
                ${produto.Origem ? `
                <p class="produto-origem">
                    <i class="fas fa-map-marker-alt"></i> Origem: ${produto.Origem}
                </p>` : ''}

                <p class="produto-descricao">
                    ${produto.Descricao || 'Sem descrição disponível.'}
                </t>

                <div class="produto-valor">
                    <span class="price">${precoFormatado}</span>
                    <a href="#" class="produto-btn" data-id="${produto.IdProduto}">
                        <i class="fas fa-shopping-cart"></i> Comprar
                    </a>
                </div>
            </div>
        `;
        // --- FIM DA MUDANÇA ---
        
        // Adiciona o listener no botão "Comprar" (código existente)
        const btnComprar = card.querySelector('.produto-btn');
        btnComprar.addEventListener('click', (e) => {
            e.preventDefault(); 
            const id = e.currentTarget.dataset.id;
            adicionarAoCarrinho(id);
        });

        // Adiciona o card pronto ao grid
        gridContainer.appendChild(card);
    });
}


/**
 * Lógica do botão "Comprar".
 */
function adicionarAoCarrinho(idProduto) {
    const produto = todosOsProdutos.find(p => p.IdProduto == idProduto);
    
    console.log("--- LÓGICA DO CARRINHO ---");
    console.log("Adicionando ao carrinho (lógica não implementada):");
    console.log("ID:", idProduto);
    console.log("Produto:", produto.Nome);
    console.log("Preço:", produto.Preco);
    console.log("--------------------------");

    alert(`"${produto.Nome}" foi adicionado ao carrinho! (ver console)`);
}