// assets/js/produto-pagina.js
import productFactory from './produtos.js';

// Função principal, executada quando a página carrega
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Pegar o ID da URL
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id'); // Pega o valor depois de '?id='

    const wrapper = document.querySelector('.produto-detalhe-wrapper');

    if (!produtoId) {
        // Se não tiver ID, mostra erro
        wrapper.innerHTML = '<h1>Erro: Produto não especificado.</h1> <a href="catalogo.html">Voltar ao catálogo</a>';
        return;
    }

    // 2. Buscar o produto na API usando nossa fábrica
    const produto = await productFactory.getProdutoPorId(produtoId);

    if (!produto) {
        // Se a API retornar erro ou não encontrar
        wrapper.innerHTML = `<h1>Erro: Produto com ID ${produtoId} não encontrado.</h1> <a href="catalogo.html">Voltar ao catálogo</a>`;
        return;
    }

    // 3. Preencher o HTML com os dados do produto
    preencherDadosProduto(produto);
});


/**
 * Recebe o objeto do produto e preenche os elementos do HTML
 * @param {Object} produto - O objeto do produto vindo da API
 */
function preencherDadosProduto(produto) {
    // Formata o preço
    const precoFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(produto.Preco);

    // Formata o peso (ex: 0.250kg -> 250g)
    const pesoFormatado = (produto.Peso * 1000) + 'g';

    // Formata a data (ex: 2026-10-15T00:00:00.000Z -> 15/10/2026)
    let dataFormatada = 'N/A';
    if (produto.DataDeValidade) {
        try {
            // Adiciona 1 dia (Timezone fix) e formata
            const data = new Date(produto.DataDeValidade);
            data.setMinutes(data.getMinutes() + data.getTimezoneOffset()); // Ajuste de fuso
            dataFormatada = data.toLocaleDateString('pt-BR');
        } catch(e) {
            console.warn("Data de validade em formato inválido:", produto.DataDeValidade);
        }
    }
    
    // Atualiza os elementos do DOM
    document.title = produto.Nome; // Atualiza o título da aba do navegador
    document.getElementById('produto-nome').innerText = produto.Nome;
    document.getElementById('produto-imagem').src = produto.Imagem || '../assets/images/cafe-placeholder.jpg';
    document.getElementById('produto-imagem').alt = produto.Nome;
    
    document.getElementById('produto-tipo').innerText = produto.Tipo || '';
    document.getElementById('produto-origem').innerText = produto.Origem ? `Origem: ${produto.Origem}` : '';
    document.getElementById('produto-intensidade').innerText = produto.Intensidade ? `Intensidade: ${produto.Intensidade}` : '';

    document.getElementById('produto-preco').innerText = precoFormatado;
    document.getElementById('produto-descricao').innerText = produto.Descricao || 'Descrição não disponível.';
    
    document.getElementById('produto-peso').innerText = pesoFormatado;
    document.getElementById('produto-validade').innerText = dataFormatada;
    document.getElementById('produto-estoque').innerText = produto.Quantidade;

    // Adiciona o ID ao botão de comprar para a lógica do carrinho
    const btnComprar = document.getElementById('produto-btn-comprar');
    btnComprar.dataset.id = produto.IdProduto;
    btnComprar.addEventListener('click', (e) => {
        e.preventDefault();
        // A lógica do carrinho virá aqui
        alert(`Adicionando "${produto.Nome}" ao carrinho! (Lógica do carrinho pendente)`);
        console.log("Adicionar ao carrinho (detalhe):", produto);
    });
}