// Pega os itens do carrinho armazenados no localStorage
let itensDoCarrinho = JSON.parse(localStorage.getItem("carrinhoSelecionados")) || [];

// Elementos do DOM - CORREÇÃO DOS SELETORES
const carrinhoContainer = document.querySelector(".carrinho-itens");
const subtotalEl = document.querySelector(".resumo-linha:first-child span:last-child");
const freteEl = document.querySelector(".resumo-linha:nth-child(2) span:last-child");
const totalEl = document.querySelector(".resumo-total span:last-child");
const btnFinalizar = document.querySelector(".btn-finalizar");

// Variáveis para frete
let freteCalculado = 0;
let cepAtual = '';
let prazoEntrega = '';

// Variável global para armazenar o método de pagamento
let metodoPagamentoSelecionado = 'credit-card';

// Função para buscar produto individual por ID
async function fetchProductById(productId) {
    try {
        const response = await fetch(`/api/produtos/${productId}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const product = await response.json();
        return product;
    } catch (error) {
        console.error("Erro ao buscar produto:", error);
        return null;
    }
}

// Monta o carrinho buscando dados completos de cada produto
async function montarCarrinho() {
    if (!carrinhoContainer) {
        console.error("Container do carrinho não encontrado!");
        return;
    }

    if (itensDoCarrinho.length === 0) {
        carrinhoContainer.innerHTML = "<p class='carrinho-vazio'>Seu carrinho está vazio.</p>";
        atualizarResumo(0, 0);
        atualizarSubtotal(0, 0);
        return;
    }

    try {
        // Busca dados completos de cada produto
        const produtosCompletos = [];
        
        for (const item of itensDoCarrinho) {
            const produto = await fetchProductById(item.id);
            if (produto) {
                // Combina dados do produto com quantidade do carrinho
                const preco = produto.Preco || 0;
                const quantidade = item.quantidade || 1;
                
                produtosCompletos.push({
                    ...produto,
                    quantidade: quantidade,
                    subtotal: preco * quantidade
                });
            }
        }

        if (produtosCompletos.length === 0) {
            throw new Error("Nenhum produto foi carregado com sucesso");
        }

        renderCarrinho(produtosCompletos);
        
    } catch (err) {
        console.error("Erro ao montar carrinho:", err);
        carrinhoContainer.innerHTML = `
        <div class="erro-carrinho">
            <p>Erro ao carregar carrinho. Tente novamente.</p>
        </div>
        `;
    }
}

// Renderiza o carrinho
function renderCarrinho(produtos) {
    carrinhoContainer.innerHTML = "";

    let subtotal = 0;
    
    produtos.forEach(produto => {
        subtotal += produto.subtotal;

        const itemCard = document.createElement("div");
        itemCard.classList.add("item-card");
        itemCard.dataset.id = produto.IdProduto;

        // Formata o peso para exibição
        const pesoFormatado = produto.Peso ? `${produto.Peso}g` : 'N/A';
        
        itemCard.innerHTML = `
        <img src="${produto.Imagem}" 
                alt="${produto.Nome}" 
                class="item-img">
        <div class="item-details">
            <h4>${produto.Nome}</h4>
            <p><strong>Tipo:</strong> ${produto.Tipo}</p>
            <p><strong>Origem:</strong> ${produto.Origem}</p>
            <p><strong>Intensidade:</strong> ${produto.Intensidade}</p>
            <p><strong>Peso:</strong> ${pesoFormatado}</p>
            <p class="descricao"><strong>Descrição:</strong> ${produto.Descricao}</p>
            <div class="item-quantity">
            <button class="quantity-btn" data-action="decrease">-</button>
            <span class="quantidade-display">${produto.quantidade}</span>
            <button class="quantity-btn" data-action="increase">+</button>
            </div>
        </div>
        <span class="item-price">R$ ${produto.Preco.toFixed(2)}</span>
        <i class="fas fa-trash item-remove" title="Remover item"></i>
        `;

        carrinhoContainer.appendChild(itemCard);
    });

    // CALCULA O TOTAL: Subtotal + Frete
    const total = subtotal + freteCalculado;
    
    atualizarResumo(subtotal, freteCalculado, total, produtos.length);
    atualizarSubtotal(subtotal, produtos.length);
    addListeners();
}

// Atualiza o resumo do pedido - CORREÇÃO DA LÓGICA
function atualizarResumo(subtotal, frete, total, quantidadeItens = 0) {
    console.log("Atualizando resumo:", { subtotal, frete, total, quantidadeItens });
    
    // ATUALIZA O LABEL DO SUBTOTAL COM A QUANTIDADE DE ITENS
    const subtotalLabel = document.querySelector(".resumo-linha:first-child span:first-child");
    if (subtotalLabel) {
        subtotalLabel.textContent = `Subtotal (${quantidadeItens} ${quantidadeItens === 1 ? 'item' : 'itens'})`;
    }
    
    // ATUALIZA O VALOR DO SUBTOTAL
    if (subtotalEl) {
        subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
    }
    
    // Frete: valor do frete calculado
    if (freteEl) {
        freteEl.textContent = frete > 0 ? `R$ ${frete.toFixed(2)}` : 'Grátis';
    }
    
    // Total: Subtotal + Frete
    if (totalEl) {
        totalEl.textContent = `R$ ${total.toFixed(2)}`;
    }
}

// Função para calcular subtotal (usada no frete)
function calcularSubtotal() {
    if (itensDoCarrinho.length === 0) return 0;
    
    let subtotal = 0;
    
    // Se temos produtos carregados, usa os preços reais
    const produtosNoCarrinho = document.querySelectorAll('.item-card');
    if (produtosNoCarrinho.length > 0) {
        produtosNoCarrinho.forEach(item => {
            const precoText = item.querySelector('.item-price').textContent;
            const preco = parseFloat(precoText.replace('R$ ', '').replace(',', '.'));
            const quantidade = parseInt(item.querySelector('.quantidade-display').textContent);
            subtotal += preco * quantidade;
        });
    } else {
        // Fallback: cálculo estimado
        itensDoCarrinho.forEach(item => {
            subtotal += (item.quantidade || 1) * 35;
        });
    }
    
    return subtotal;
}

// Eventos de quantidade e remoção
function addListeners() {
    // Eventos dos botões de quantidade
    carrinhoContainer.querySelectorAll(".quantity-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const itemCard = e.target.closest(".item-card");
            const id = parseInt(itemCard.dataset.id);
            const action = e.target.dataset.action;

            // Atualiza quantidade no localStorage
            itensDoCarrinho = itensDoCarrinho.map(item => {
                if (item.id === id) {
                    if (action === "increase") {
                        return { ...item, quantidade: (item.quantidade || 1) + 1 };
                    } else if (action === "decrease" && (item.quantidade || 1) > 1) {
                        return { ...item, quantidade: (item.quantidade || 1) - 1 };
                    }
                }
                return item;
            });

            localStorage.setItem("carrinhoSelecionados", JSON.stringify(itensDoCarrinho));
            
            // ATUALIZAÇÃO SUAVE - apenas recalcula os valores sem reconstruir todo o carrinho
            atualizarValoresCarrinho();
        });
    });

    // Eventos de remoção
    carrinhoContainer.querySelectorAll(".item-remove").forEach(btn => {
        btn.addEventListener("click", e => {
            const itemCard = e.target.closest(".item-card");
            const id = parseInt(itemCard.dataset.id);

            itensDoCarrinho = itensDoCarrinho.filter(item => item.id !== id);
            localStorage.setItem("carrinhoSelecionados", JSON.stringify(itensDoCarrinho));

            // Se não há mais itens, mostra carrinho vazio, senão atualiza apenas os valores
            if (itensDoCarrinho.length === 0) {
                montarCarrinho(); // Recarrega completamente quando está vazio
            } else {
                atualizarValoresCarrinho();
            }
        });
    });
}

// NOVA FUNÇÃO: Atualiza apenas os valores sem reconstruir todo o carrinho
function atualizarValoresCarrinho() {
    const subtotal = calcularSubtotal();
    const total = subtotal + freteCalculado;
    const quantidadeItens = itensDoCarrinho.reduce((total, item) => total + (item.quantidade || 1), 0);
    
    atualizarResumo(subtotal, freteCalculado, total, quantidadeItens);
    atualizarSubtotal(subtotal, quantidadeItens);
    
    // Atualiza as quantidades nos itens visíveis
    itensDoCarrinho.forEach(item => {
        const itemElement = document.querySelector(`.item-card[data-id="${item.id}"]`);
        if (itemElement) {
            const quantidadeDisplay = itemElement.querySelector('.quantidade-display');
            if (quantidadeDisplay) {
                quantidadeDisplay.textContent = item.quantidade || 1;
            }
        }
    });
}

// Função para mostrar mensagem de validação
function mostrarMensagem(mensagem, tipo = 'error') {
    let mensagemDiv = document.getElementById('mensagem-validacao');
    
    if (!mensagemDiv) {
        mensagemDiv = document.createElement('div');
        mensagemDiv.id = 'mensagem-validacao';
        mensagemDiv.style.cssText = `
            margin-top: 10px;
            padding: 10px;
            border-radius: 5px;
            font-size: 14px;
            text-align: center;
        `;
        
        const btnFinalizar = document.querySelector('.btn-finalizar');
        if (btnFinalizar) {
            btnFinalizar.parentNode.insertBefore(mensagemDiv, btnFinalizar.nextSibling);
        }
    }
    
    if (tipo === 'error') {
        mensagemDiv.style.backgroundColor = '#ffebee';
        mensagemDiv.style.color = '#d32f2f';
        mensagemDiv.style.border = '1px solid #d32f2f';
    } else {
        mensagemDiv.style.backgroundColor = '#e8f5e8';
        mensagemDiv.style.color = '#2e7d32';
        mensagemDiv.style.border = '1px solid #2e7d32';
    }
    
    mensagemDiv.innerHTML = `<i class="fas fa-${tipo === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i> ${mensagem}`;
    
    setTimeout(() => {
        if (mensagemDiv) {
            mensagemDiv.remove();
        }
    }, 5000);
}

// Finalizar compra - ATUALIZADA para usar a rota /comprar
// Finalizar compra - SEM VALIDAÇÃO DE EMAIL
// Finalizar compra - VERSÃO SIMPLIFICADA
// Finalizar compra - VERSÃO CORRIGIDA
if (btnFinalizar) {
    btnFinalizar.addEventListener("click", async () => {
        console.log("🟡 Iniciando compra...");
        
        // Validações básicas
        if (itensDoCarrinho.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        if (freteCalculado === 0) {
            alert("Calcule o frete primeiro!");
            return;
        }

        if (!cepAtual) {
            alert("Informe um CEP!");
            return;
        }

        // Solicitar email
        const emailUsuario = prompt("Informe seu e-mail:");
        if (!emailUsuario) {
            alert("E-mail é obrigatório!");
            return;
        }

        // Calcular totais
        const subtotal = calcularSubtotal();
        const total = subtotal + freteCalculado;

        // Mostrar confirmação
        const confirmacao = confirm(
            `Confirmar compra?\n\n` +
            `Itens: ${itensDoCarrinho.length}\n` +
            `Subtotal: R$ ${subtotal.toFixed(2)}\n` +
            `Frete: R$ ${freteCalculado.toFixed(2)}\n` +
            `Total: R$ ${total.toFixed(2)}\n` +
            `E-mail: ${emailUsuario}`
        );
        
        if (!confirmacao) {
            console.log("🔴 Compra cancelada pelo usuário");
            return;
        }

        // Preparar dados
        const dadosCompra = {
            emailUsuario: emailUsuario,
            itens: itensDoCarrinho,
            enderecoEntrega: { cep: cepAtual },
            valor: {
                subtotal: subtotal,
                frete: freteCalculado,
                total: total
            },
            metodoPagamento: metodoPagamentoSelecionado
        };

        try {
            console.log("📤 Enviando compra...");
            
            const res = await fetch("/api/shop/comprar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosCompra)
            });

            console.log("📥 Status da resposta:", res.status);
            
            // Verificar se a resposta é JSON válido
            const responseText = await res.text();
            console.log("📥 Resposta bruta:", responseText);
            
            let resultado;
            try {
                resultado = JSON.parse(responseText);
            } catch (e) {
                console.error("❌ Resposta não é JSON válido:", responseText);
                alert("Erro no servidor! Resposta inválida.");
                return;
            }

            console.log("📥 Dados parseados:", resultado);

            if (resultado.success) {
                console.log("🎉 Compra bem-sucedida! ID:", resultado.idCompra);
                alert(`✅ Compra realizada com sucesso!\nNº do pedido: ${resultado.idCompra}`);
                
                // Limpar carrinho
                localStorage.removeItem("carrinhoSelecionados");
                localStorage.removeItem("dadosFrete");
                itensDoCarrinho = [];
                freteCalculado = 0;
                cepAtual = '';
                
                
                // Atualizar interface
                carrinhoContainer.innerHTML = "<p class='carrinho-vazio'>Compra realizada com sucesso! Seu carrinho está vazio.</p>";
                atualizarResumo(0, 0, 0, 0);
                atualizarSubtotal(0, 0);
                
            } else {
                console.error("❌ Erro na resposta:", resultado.message);
                alert("❌ Erro: " + resultado.message);
            }

        } catch (err) {
            console.error("💥 Erro na requisição:", err);
            alert("❌ Erro de conexão com o servidor!");
        }
    });
}

// Cupom de desconto
const btnApplyCoupon = document.querySelector('.btn-apply-coupon');
if (btnApplyCoupon) {
    btnApplyCoupon.addEventListener('click', () => {
        const couponInput = document.querySelector('.coupon-input-group input');
        const couponCode = couponInput.value.trim();
        
        if (couponCode) {
            mostrarMensagem(`Cupom ${couponCode} aplicado com sucesso!`, 'success');
            couponInput.value = '';
        } else {
            mostrarMensagem('Por favor, insira um código de cupom.', 'error');
        }
    });
}

// Função para inicializar os eventos de pagamento
function inicializarPagamento() {
    const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            metodoPagamentoSelecionado = e.target.value;
            salvarPreferenciasPagamento();
        });
    });
    
    carregarPreferenciasPagamento();
}

// Salvar preferência de pagamento no localStorage
function salvarPreferenciasPagamento() {
    const preferencias = {
        metodoPagamento: metodoPagamentoSelecionado
    };
    localStorage.setItem('preferenciasPagamento', JSON.stringify(preferencias));
}

// Carregar preferência de pagamento do localStorage
function carregarPreferenciasPagamento() {
    const preferenciasSalvas = localStorage.getItem('preferenciasPagamento');
    if (preferenciasSalvas) {
        const preferencias = JSON.parse(preferenciasSalvas);
        metodoPagamentoSelecionado = preferencias.metodoPagamento || 'credit-card';
        
        const radioToCheck = document.querySelector(`input[name="payment-method"][value="${metodoPagamentoSelecionado}"]`);
        if (radioToCheck) {
            radioToCheck.checked = true;
        }
    }
}

// Função para validar CEP
function validarCEP(cep) {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
}

// Função para inicializar o cálculo de frete
function inicializarCalculoFrete() {
    const cepInput = document.getElementById('cep-input');
    const btnCalcularFrete = document.getElementById('btn-calcular-frete');

    // Máscara para CEP (00000-000)
    cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        e.target.value = value;
        
        if (!validarCEP(value)) {
            document.getElementById('shipping-result').innerHTML = '';
        }
    });

    btnCalcularFrete.addEventListener('click', calcularFrete);
    
    cepInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calcularFrete();
        }
    });

    carregarCEPSalvo();
}

// Função para calcular frete fictício
function calcularFrete() {
    const cepInput = document.getElementById('cep-input');
    const btnCalcularFrete = document.getElementById('btn-calcular-frete');
    const shippingResult = document.getElementById('shipping-result');

    const cep = cepInput.value;
    
    if (!validarCEP(cep)) {
        shippingResult.innerHTML = '<span class="error">Formato de CEP inválido</span>';
        return;
    }

    btnCalcularFrete.disabled = true;
    btnCalcularFrete.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    shippingResult.innerHTML = '<span class="loading">Calculando frete...</span>';

    setTimeout(() => {
        const cepNumeros = cep.replace(/\D/g, '');
        const regiao = parseInt(cepNumeros.charAt(0));
        let novoFrete = 0;
        let prazo = 0;

        switch(regiao) {
            case 0: case 1: case 2: case 3:
                novoFrete = 18.50;
                prazo = 3;
                break;
            case 4: case 5:
                novoFrete = 22.00;
                prazo = 5;
                break;
            case 6: case 7:
                novoFrete = 28.50;
                prazo = 7;
                break;
            case 8: case 9:
                novoFrete = 32.00;
                prazo = 9;
                break;
            default:
                novoFrete = 25.00;
                prazo = 5;
        }

        const subtotal = calcularSubtotal();
        if (subtotal > 100) {
            novoFrete = 15.00;
            prazo = 4;
        }

        freteCalculado = novoFrete;
        cepAtual = cep;
        prazoEntrega = prazo;
        
        salvarCEPSalvo();
        
        shippingResult.innerHTML = `
            <span class="success">
                Frete: R$ ${novoFrete.toFixed(2)} 
                (${prazo} dia${prazo > 1 ? 's' : ''} útil${prazo > 1 ? 'eis' : ''})
                ${subtotal > 100 ? '🌟 Frete promocional!' : ''}
            </span>
        `;
        
        // Atualização suave - apenas os valores, sem reconstruir o carrinho
        if (itensDoCarrinho.length > 0) {
            atualizarValoresCarrinho();
        } else {
            atualizarResumo(0, novoFrete, novoFrete);
            atualizarSubtotal(0, 0);
        }

        btnCalcularFrete.disabled = false;
        btnCalcularFrete.innerHTML = '<i class="fas fa-truck"></i>';
    }, 1000);
}

// Salvar CEP no localStorage
function salvarCEPSalvo() {
    const dadosFrete = {
        cep: cepAtual,
        valor: freteCalculado,
        prazo: prazoEntrega
    };
    localStorage.setItem('dadosFrete', JSON.stringify(dadosFrete));
}

// Carregar CEP do localStorage
function carregarCEPSalvo() {
    const dadosSalvos = localStorage.getItem('dadosFrete');
    if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        cepAtual = dados.cep;
        freteCalculado = dados.valor || 0;
        prazoEntrega = dados.prazo || '';
        
        const cepInput = document.getElementById('cep-input');
        const shippingResult = document.getElementById('shipping-result');
        
        if (cepInput && cepAtual) {
            cepInput.value = cepAtual;
        }
        
        if (shippingResult && freteCalculado > 0) {
            shippingResult.innerHTML = `
                <span class="success">
                    Frete: R$ ${freteCalculado.toFixed(2)} 
                    ${prazoEntrega ? `(${prazoEntrega} dia${prazoEntrega > 1 ? 's' : ''} útil${prazoEntrega > 1 ? 'eis' : ''})` : ''}
                </span>
            `;
        }
    }
}

// NOVA FUNÇÃO específica para atualizar apenas o subtotal
function atualizarSubtotal(subtotal, quantidadeItens = 0) {
    console.log("Atualizando subtotal:", { subtotal, quantidadeItens });
    
    // Atualiza APENAS o subtotal usando IDs
    const subtotalLabel = document.getElementById('subtotal-label');
    const subtotalValue = document.getElementById('subtotal-value');
    
    if (subtotalLabel) {
        subtotalLabel.textContent = `Subtotal (${quantidadeItens} ${quantidadeItens === 1 ? 'item' : 'itens'})`;
    }
    
    if (subtotalValue) {
        subtotalValue.textContent = `R$ ${subtotal.toFixed(2)}`;
    }
}

// Inicializa o carrinho quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    montarCarrinho();
    inicializarPagamento();
    inicializarCalculoFrete();
});