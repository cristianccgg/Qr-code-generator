const qrContainer = document.getElementById("qr-container");
const form = document.getElementById("form");
const btn = document.getElementById("btn");
const qrDescriptionInput = document.getElementById("input-description");
const descriptionResult = document.getElementById("description-result");

const QR = new QRCode(qrContainer);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  QR.makeCode(form.input.value);
  descriptionResult.innerText = qrDescriptionInput.value;
});
