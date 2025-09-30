
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