
// Função para o menu responsivo
function myMenuFunction() {
    var i = document.getElementById("navMenu");
    if (i.className === "nav-menu") {
        i.className += " responsive";
    } else {
        i.className = "nav-menu";
    }
}

const formModal = document.getElementById("formModal");
const loginContainer = document.getElementById("login");
const registerContainer = document.getElementById("register");

function showLogin() {
    formModal.classList.add("show");
    loginContainer.style.left = "4px";
    registerContainer.style.right = "-520px";
    loginContainer.style.opacity = 1;
    registerContainer.style.opacity = 0;
}

function showRegister() {
    formModal.classList.add("show");
    loginContainer.style.left = "-510px";
    registerContainer.style.right = "5px";
    loginContainer.style.opacity = 0;
    registerContainer.style.opacity = 1;
}

function hideModal() {
    formModal.classList.remove("show");
}

document.getElementById("loginBtn").addEventListener("click", showLogin);
document.getElementById("registerBtn").addEventListener("click", showRegister);

window.addEventListener("click", (event) => {
    if (event.target === formModal) {
        hideModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
 const form = document.getElementById('formCadastro');
    

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // previne envio normal do form

        const nome = document.getElementById('txt_nome').value;
        const email = document.getElementById('txt_email').value;
        const senha = document.getElementById('txt_senha').value;
        const conf_senha = document.getElementById('txt_senhaConfirmar').value;

        if (senha !== conf_senha) {
            mensagem.innerText = 'As senhas não coincidem!';
            return;
        }

        try {
            const response = await fetch('/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });

            const data = await response.json();

            if (response.ok) {
                mensagem.style.color = 'green';
                mensagem.innerText = data.mensagem;
                form.reset();
            } else {
                mensagem.style.color = 'red';
                mensagem.innerText = data.error;
            }
        } catch (err) {
            mensagem.style.color = 'red';
            mensagem.innerText = 'Erro ao cadastrar usuário';
            console.error(err);
        }
    })});

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('formLogin');
        

        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // previne envio normal do form

            
            const emailLogin = document.getElementById('txt_emailLogin').value;
            const senhaLogin = document.getElementById('txt_senhaLogin').value;
            

            try {
                const response = await fetch('/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const data = await response.json();

                if (response.ok) {
                    mensagem.style.color = 'green';
                    mensagem.innerText = data.mensagem;
                    form.reset();
                } else {
                    mensagem.style.color = 'red';
                    mensagem.innerText = data.error;
                }
            } catch (err) {
                mensagem.style.color = 'red';
                mensagem.innerText = 'Erro ao cadastrar usuário';
                console.error(err);
            }
        })});