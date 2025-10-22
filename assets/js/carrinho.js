// Pega os itens do carrinho armazenados no localStorage
let itensDoCarrinho = JSON.parse(localStorage.getItem("carrinhoSelecionados")) || [];

// Elementos do DOM
const carrinhoContainer = document.querySelector(".carrinho-itens");
const subtotalEl = document.querySelector(".resumo-linha:nth-child(1) span:last-child");
const freteEl = document.querySelector(".resumo-linha:nth-child(2) span:last-child");
const totalEl = document.querySelector(".resumo-total span:last-child");
const btnFinalizar = document.querySelector(".btn-finalizar");

// Função para buscar dados reais do carrinho no backend
async function montarCarrinho() {
  if (itensDoCarrinho.length === 0) {
    carrinhoContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
    subtotalEl.textContent = "R$ 0,00";
    freteEl.textContent = "R$ 0,00";
    totalEl.textContent = "R$ 0,00";
    return;
  }

  try {
    const res = await fetch("/api/shop/montar-carrinho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itens: itensDoCarrinho })
    });
    const data = await res.json();

    renderCarrinho(data.carrinho, data.subtotal, data.frete, data.total);
  } catch (err) {
    console.error("Erro ao montar carrinho:", err);
  }
}

// Renderiza os itens e valores no HTML
function renderCarrinho(itens, subtotal, frete, total) {
  carrinhoContainer.innerHTML = "";

  itens.forEach(item => {
    const itemCard = document.createElement("div");
    itemCard.classList.add("item-card");
    itemCard.dataset.id = item.id;

    itemCard.innerHTML = `
      <img src="../assets/images/produto-${item.id}.jpg" alt="${item.nome}" class="item-img">
      <div class="item-details">
        <h4>${item.nome}</h4>
        <p>${item.tipo}</p>
        <div class="item-quantity">
          <button class="quantity-btn" data-action="decrease">-</button>
          <input type="number" value="${item.quantidade}" min="1" class="quantity-input">
          <button class="quantity-btn" data-action="increase">+</button>
        </div>
      </div>
      <span class="item-price">R$ ${item.preco.toFixed(2)}</span>
      <i class="fas fa-trash item-remove" title="Remover item"></i>
    `;

    carrinhoContainer.appendChild(itemCard);
  });

  // Atualiza valores
  subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
  freteEl.textContent = `R$ ${frete.toFixed(2)}`;
  totalEl.textContent = `R$ ${total.toFixed(2)}`;

  addListeners(); // Adiciona eventos aos botões e inputs
}

// Adiciona eventos para aumentar/diminuir/remover itens
function addListeners() {
  carrinhoContainer.querySelectorAll(".quantity-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const itemCard = e.target.closest(".item-card");
      const id = parseInt(itemCard.dataset.id);
      const input = itemCard.querySelector(".quantity-input");
      const action = e.target.dataset.action;

      if (action === "increase") input.value = parseInt(input.value) + 1;
      if (action === "decrease" && parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;

      // Atualiza localStorage
      itensDoCarrinho = itensDoCarrinho.map(i => i.id === id ? { ...i, quantidade: parseInt(input.value) } : i);
      localStorage.setItem("carrinhoSelecionados", JSON.stringify(itensDoCarrinho));

      montarCarrinho(); // Recarrega o carrinho
    });
  });

  carrinhoContainer.querySelectorAll(".item-remove").forEach(btn => {
    btn.addEventListener("click", e => {
      const itemCard = e.target.closest(".item-card");
      const id = parseInt(itemCard.dataset.id);
      itensDoCarrinho = itensDoCarrinho.filter(i => i.id !== id);
      localStorage.setItem("carrinhoSelecionados", JSON.stringify(itensDoCarrinho));
      montarCarrinho();
    });
  });
}

// Finalizar compra
btnFinalizar.addEventListener("click", async () => {
  const emailUsuario = prompt("Informe seu e-mail para finalizar a compra:");
  if (!emailUsuario) return alert("E-mail obrigatório.");

  try {
    const res = await fetch("/api/shop/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailUsuario,
        itens: itensDoCarrinho,
        precoFrete: 25,
        desconto: 0
      })
    });

    if (res.ok) {
      alert("Compra finalizada com sucesso!");
      localStorage.removeItem("carrinhoSelecionados");
      montarCarrinho();
    } else {
      alert("Erro ao finalizar compra.");
    }
  } catch (err) {
    console.error("Erro no checkout:", err);
    alert("Erro ao finalizar compra.");
  }
});

// Inicializa carrinho
montarCarrinho();
