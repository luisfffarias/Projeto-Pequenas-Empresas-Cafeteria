// assets/js/plano-detalhe.js
import planosFactory from './planosFactory.js'; 

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const planoId = params.get('id');
    // Renomeei o container para evitar confusão com o wrapper
    const container = document.getElementById('detalhe-container'); 

    if (!planoId) {
        container.innerHTML = '<h1>Erro: Plano não especificado.</h1> <a href="planos.html">Voltar aos planos</a>';
        return;
    }

    const plano = await planosFactory.getPlanoPorId(planoId);

    if (!plano) {
        container.innerHTML = `<h1>Erro: Plano com ID ${planoId} não encontrado.</h1> <a href="planos.html">Voltar aos planos</a>`;
        return;
    }

    preencherDadosPlano(plano);
});

function preencherDadosPlano(plano) {
    const precoFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(plano.Preco);
    
    const tipoPreco = plano.Tipo === 'Anual' ? '/ano' : '/mês';

    document.title = plano.Nome; 
    document.getElementById('plano-nome').innerText = plano.Nome;
    document.getElementById('plano-imagem').src = plano.Imagem || '../assets/images/cafe-placeholder.jpg';
    document.getElementById('plano-imagem').alt = plano.Nome;
    
    document.getElementById('plano-tipo').innerText = plano.Tipo || '';
    document.getElementById('plano-modalidade').innerText = plano.Modalidade || '';

    // Usamos .innerHTML para renderizar o <span>
    document.getElementById('plano-preco').innerHTML = `${precoFormatado} <span style="font-size: 1.2rem; font-weight: 400; color: #ccc;">${tipoPreco}</span>`;
    document.getElementById('plano-descricao').innerText = plano.Descricao || 'Descrição não disponível.';

    const btnAssinar = document.getElementById('plano-btn-assinar');
    btnAssinar.dataset.id = plano.IdPlano;
    btnAssinar.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Iniciando assinatura do "${plano.Nome}"! (Lógica pendente)`);
        console.log("Assinar plano (detalhe):", plano);
    });
}