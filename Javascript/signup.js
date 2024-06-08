const signupBtn = document.getElementById("signup-btn");
const signupContainer = document.getElementById("signup-container");
const background = document.getElementById("main");
const loginToggle = document.getElementById("login-toggle-btn");
const signupForm = document.getElementById("signup-form");
const signupUsernameInput = document.getElementById("signup-username");
const signupPasswordInput = document.getElementById("signup-password");
const signupEmailInput = document.getElementById("signup-email");

signupBtn.addEventListener("click", () => {
  signupContainer.classList.remove("d-none");
  background.classList.add("background-main");
  loginContainer.classList.add("d-none");
});

loginToggle.addEventListener("click", () => {
  loginContainer.classList.remove("d-none");
  signupContainer.classList.add("d-none");
});

// FUNCION ENVIO DE FORMULARIO SIGN UP

const emailRegex =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

signupForm.addEventListener("submit", function (event) {
  if (
    !signupUsernameInput.value.trim() ||
    !signupPasswordInput.value.trim() ||
    !signupEmailInput.value.trim() ||
    !usernameRegex.test(signupUsernameInput.value) ||
    !passwordRegex.test(signupPasswordInput.value) ||
    !emailRegex.test(signupEmailInput.value)
  ) {
    alert("Por favor, complete todos los campos correctamente.");
    event.preventDefault();
  }
});
