// assets/js/historico-compras.js
import adminHistoricoFactory from './adminHistoricoFactory.js';

// --- ELEMENTOS DO DOM ---
const historyTableBody = document.getElementById('history-table-body');
const listHistoryMessage = document.getElementById('list-history-message');

/**
 * Função principal - Carrega o histórico ao iniciar
 */
document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();
});

/**
 * Busca o histórico na API e preenche a tabela
 */
async function carregarHistorico() {
    if (!historyTableBody) return;
    historyTableBody.innerHTML = '<tr><td colspan="10">A carregar histórico...</td></tr>';
    setMessage(listHistoryMessage); // Limpa mensagens

    try {
        const historico = await adminHistoricoFactory.getHistoricoCompleto();
        renderizarTabelaHistorico(historico);
    } catch (error) {
        setMessage(listHistoryMessage, `Erro ao carregar histórico: ${error.message}`, 'error');
        historyTableBody.innerHTML = '<tr><td colspan="10">Falha ao carregar. Tente novamente.</td></tr>';
    }
}

/**
 * Preenche a tabela HTML com os dados do histórico
 */
function renderizarTabelaHistorico(historico) {
    if (!historyTableBody) return;
    historyTableBody.innerHTML = ''; // Limpa a tabela

    if (!historico || historico.length === 0) {
        historyTableBody.innerHTML = '<tr><td colspan="10">Nenhum registo de compra encontrado.</td></tr>';
        return;
    }

    // Funções auxiliares de formatação
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            // Converte a data (assume que vem em formato ISO ou compatível)
            const date = new Date(dateString);
             // Formata para dd/mm/aaaa hh:mm
            return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'});
        } catch (e) {
            return dateString; // Retorna string original se falhar
        }
    };


    historico.forEach(compra => {
        const row = historyTableBody.insertRow();
        row.dataset.compraId = compra.IdCompra; // Guarda o ID na linha

        row.innerHTML = `
            <td>${compra.IdCompra}</td>
            <td>${formatDate(compra.DataDaCompra)}</td>
            <td>${escapeHtml(compra.NomeUsuario || 'Utilizador Desconhecido')}</td>
            <td>${escapeHtml(compra.EmailUsuario)}</td>
            <td>${escapeHtml(compra.NomeProduto || 'Produto Desconhecido')} (ID: ${compra.IdProduto})</td>
            <td>${compra.QuantidadeUnitaria}</td>
            <td>${formatCurrency(compra.PrecoUnitario)}</td>
            <td>${formatCurrency(compra.PrecoFrete)}</td>
            <td>${formatCurrency(compra.Desconto)}</td>
            <td>${formatCurrency(compra.PrecoTotal)}</td>
            `;
    });
}

// --- Funções Auxiliares (Copie de outro admin JS) ---
function setMessage(element, text = '', type = '') {
    if (!element) return;
    element.textContent = text;
    element.className = 'message';
    if (type) element.classList.add(type);
    element.style.display = text ? 'block' : 'none';
}
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}