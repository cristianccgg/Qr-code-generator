const loginBtn = document.getElementById("login-btn");
const loginContainer = document.getElementById("login-container");
const backgroundForLogin = document.getElementById("main");
const signupToggle = document.getElementById("signup-toggle-btn");
const xBtn = document.querySelectorAll(".x-btn");
const form = document.getElementById("login-form");
const usernameInput = document.getElementById("login-username");
const passwordInput = document.getElementById("login-password");

// LOGIN LISTENERS

loginBtn.addEventListener("click", () => {
  loginContainer.classList.remove("d-none");
  backgroundForLogin.classList.add("background-main");
  signupContainer.classList.add("d-none");
});

signupToggle.addEventListener("click", () => {
  signupContainer.classList.remove("d-none");
  loginContainer.classList.add("d-none");
});

xBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    loginContainer.classList.add("d-none");
    signupContainer.classList.add("d-none");
    backgroundForLogin.classList.remove("background-main");
  });
});

// FUNCION ENVIO DE FORMULARIO LOGIN

const usernameRegex = /^[a-zA-Z][a-zA-Z0-9-_]{3,32}$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

form.addEventListener("submit", function (event) {
  if (
    !usernameInput.value.trim() ||
    !passwordInput.value.trim() ||
    !usernameRegex.test(usernameInput.value) ||
    !passwordRegex.test(passwordInput.value)
  ) {
    alert("Por favor, complete todos los campos correctamente.");
    event.preventDefault();
  }
});
