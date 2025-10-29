// assets/js/admin-produtos.js
import productFactory from './produtos.js'; // Usa a fábrica de produtos

// --- ELEMENTOS DO DOM ---
const productsTableBody = document.getElementById('products-table-body');
const listProductsMessage = document.getElementById('list-products-message');
const modal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const productForm = document.getElementById('product-form');
const modalMessage = document.getElementById('modal-message');
const btnShowAddModal = document.getElementById('btn-show-add-modal');
const btnCloseModal = document.querySelector('.close-modal-btn');
const produtoIdInput = document.getElementById('produtoId'); // Input hidden

/**
 * Função principal
 */
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();

    // Listeners para abrir/fechar modal
    if (btnShowAddModal) {
        btnShowAddModal.addEventListener('click', () => abrirModal()); // Abre para Adicionar
    }
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', fecharModal);
    }
    // Fecha modal se clicar fora do conteúdo
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            fecharModal();
        }
    });

    // Listener para o submit do formulário do modal
    if (productForm) {
        productForm.addEventListener('submit', handleProductFormSubmit);
    }
});

/**
 * Busca produtos e preenche a tabela
 */
async function carregarProdutos() {
    if (!productsTableBody) return;
    productsTableBody.innerHTML = '<tr><td colspan="7">Carregando produtos...</td></tr>';
    setMessage(listProductsMessage);

    try {
        const produtos = await productFactory.getTodosProdutos();
        renderizarTabelaProdutos(produtos);
    } catch (error) {
        setMessage(listProductsMessage, `Erro ao carregar produtos: ${error.message}`, 'error');
        productsTableBody.innerHTML = '<tr><td colspan="7">Falha ao carregar.</td></tr>';
    }
}

/**
 * Renderiza a tabela de produtos
 */
function renderizarTabelaProdutos(produtos) {
    if (!productsTableBody) return;
    productsTableBody.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="7">Nenhum produto encontrado.</td></tr>';
        return;
    }

    // Formatação de moeda
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    produtos.forEach(prod => {
        const row = productsTableBody.insertRow();
        row.dataset.productId = prod.IdProduto;

         // Adiciona class="actions-column" à última célula <td>
        row.innerHTML = `
            <td>${prod.IdProduto}</td>
            <td>${escapeHtml(prod.Nome)}</td>
            <td>${formatCurrency(prod.Preco)}</td>
            <td>${prod.Quantidade}</td>
            <td>${escapeHtml(prod.Tipo || '-')}</td>
            <td>${escapeHtml(prod.Origem || '-')}</td>
            <td class="actions-column">
                <button class="btn btn-secondary btn-small btn-edit" data-id="${prod.IdProduto}">Editar</button>
                <button class="btn btn-danger btn-small btn-delete" data-id="${prod.IdProduto}">Excluir</button>
            </td>
        `;

        // Add listeners
        row.querySelector('.btn-edit').addEventListener('click', handleEditProduct);
        row.querySelector('.btn-delete').addEventListener('click', handleDeleteProduct);
    });
}

/**
 * Abre o Modal (para Adicionar ou Editar)
 */
function abrirModal(produto = null) {
    if (!modal || !productForm) return;

    productForm.reset(); // Limpa o formulário
    setMessage(modalMessage); // Limpa mensagens do modal
    produtoIdInput.value = ''; // Limpa ID oculto

    if (produto) {
        // Modo Edição: Preenche o formulário
        modalTitle.textContent = 'Editar Produto';
        produtoIdInput.value = produto.IdProduto; // Guarda o ID

        document.getElementById('nomeProduto').value = produto.Nome || '';
        document.getElementById('precoProduto').value = produto.Preco || '';
        document.getElementById('quantidadeProduto').value = produto.Quantidade !== null ? produto.Quantidade : 0;
        document.getElementById('tipoProduto').value = produto.Tipo || '';
        document.getElementById('origemProduto').value = produto.Origem || '';
        document.getElementById('intensidadeProduto').value = produto.Intensidade || '';
        document.getElementById('pesoProduto').value = produto.Peso || '';
        document.getElementById('validadeProduto').value = produto.DataDeValidade ? produto.DataDeValidade.split('T')[0] : '';
        document.getElementById('imagemProduto').value = produto.Imagem || '';
        document.getElementById('descricaoProduto').value = produto.Descricao || '';

    } else {
        // Modo Adição
        modalTitle.textContent = 'Adicionar novo produto';
    }

    modal.style.display = 'block'; // Mostra o modal
}

/** Fecha o Modal */
function fecharModal() {
    if (!modal) return;
    modal.style.display = 'none';
}

/**
 * Lida com o submit do formulário do Modal (Adicionar ou Editar)
 */
async function handleProductFormSubmit(event) {
    event.preventDefault();
    setMessage(modalMessage);

    const formData = new FormData(productForm);
    const dadosProduto = Object.fromEntries(formData.entries());
    const idProduto = produtoIdInput.value;

    dadosProduto.preco = parseFloat(dadosProduto.preco);
    dadosProduto.quantidade = parseInt(dadosProduto.quantidade, 10);
    dadosProduto.peso = dadosProduto.peso ? parseFloat(dadosProduto.peso) : null;
    dadosProduto.dataDeValidade = dadosProduto.dataDeValidade || null;


    if (!dadosProduto.nome || isNaN(dadosProduto.preco) || dadosProduto.preco <= 0 || isNaN(dadosProduto.quantidade) || dadosProduto.quantidade < 0) {
        setMessage(modalMessage, 'Nome, Preço válido (>0) e Quantidade válida (>=0) são obrigatórios.', 'error');
        return;
    }

    try {
        let produtoSalvo;
        if (idProduto) {
            produtoSalvo = await productFactory.atualizarProduto(idProduto, dadosProduto);
            setMessage(listProductsMessage, `Produto "${escapeHtml(produtoSalvo.Nome)}" atualizado!`, 'success');
        } else {
            produtoSalvo = await productFactory.criarProduto(dadosProduto);
            setMessage(listProductsMessage, `Produto "${escapeHtml(produtoSalvo.Nome)}" adicionado!`, 'success');
        }
        fecharModal();
        // Adiciona um pequeno delay antes de carregar, para dar tempo da mensagem ser vista
         setTimeout(() => {
            carregarProdutos(); // Recarrega a tabela
         }, 500); // Meio segundo

    } catch (error) {
        setMessage(modalMessage, `Erro ao salvar: ${error.message}`, 'error');
    }
}


/**
 * Lida com o clique no botão Editar (Busca dados e abre modal)
 */
async function handleEditProduct(event) {
    const productId = event.target.dataset.id;
    setMessage(listProductsMessage);

    try {
        const produto = await productFactory.getProdutoPorId(productId);
        if (produto) {
            abrirModal(produto);
        } else {
            setMessage(listProductsMessage, 'Não foi possível carregar dados do produto para edição.', 'error');
        }
    } catch (error) {
         setMessage(listProductsMessage, `Erro ao buscar produto para edição: ${error.message}`, 'error');
    }
}

/**
 * Lida com o clique no botão Excluir (COM CONFIRMAÇÃO E FEEDBACK)
 */
async function handleDeleteProduct(event) {
    const productId = event.target.dataset.id;
    // Pega o nome da segunda célula (índice 1) da linha (tr) pai do botão
    const productName = event.target.closest('tr').cells[1].textContent;

    // --- PASSO 1: CONFIRMAÇÃO ---
    if (confirm(`Deseja excluir o produto "${escapeHtml(productName)}" (ID: ${productId})? Esta ação não pode ser desfeita.`)) {

        setMessage(listProductsMessage); // Limpa mensagens anteriores

        try {
            // Chama a API para excluir
            await productFactory.excluirProduto(productId);

            // --- PASSO 2: FEEDBACK ---
            setMessage(listProductsMessage, `Produto "${escapeHtml(productName)}" excluído com sucesso.`, 'success');

            // Atraso opcional antes de recarregar a tabela
            setTimeout(() => {
                carregarProdutos(); // Recarrega a tabela para remover a linha
            }, 1500); // 1.5 segundos

        } catch (error) {
             // Exibe mensagem de erro se a API falhar
             setMessage(listProductsMessage, `Erro ao excluir: ${error.message}`, 'error');
        }
    } else {
        // Utilizador clicou em "Cancelar"
        console.log("Exclusão cancelada pelo administrador.");
        // Opcional: setMessage(listProductsMessage, 'Exclusão cancelada.');
    }
}


// --- Funções Auxiliares (setMessage, escapeHtml) ---
function setMessage(element, text = '', type = '') {
    if (!element) return;
    element.textContent = text;
    // Garante que a classe base 'message' sempre exista
    element.className = 'message';
    if (type) {
        element.classList.add(type); // Adiciona 'success' ou 'error'
    }
    // Mostra a mensagem (se CSS estiver a esconder por padrão)
    element.style.display = text ? 'block' : 'none';
}
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}