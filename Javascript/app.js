const qrContainer = document.getElementById("qr-container");
const form = document.getElementById("form");
const btn = document.getElementById("btn");
const qrDescriptionInput = document.getElementById("input-description");
const descriptionResult = document.getElementById("description-result");
const download = document.getElementById("downloadBtn");

const QR = new QRCode(qrContainer);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  QR.makeCode(form.input.value);
  descriptionResult.innerText = qrDescriptionInput.value;
});

downloadBtn.addEventListener("click", () => {
  const qrImage = qrContainer.querySelector("img");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = qrImage.width;
  canvas.height = qrImage.height + 40;

  ctx.drawImage(qrImage, 0, 0);

  const description = qrDescriptionInput.value;
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  const textWidth = ctx.measureText(description).width;
  const textX = (canvas.width - textWidth) / 2;
  ctx.fillText(description, textX, qrImage.height + 25);

  // Convertir el lienzo a una imagen
  const compositeImage = canvas.toDataURL("image/png");

  // Crear un enlace para descargar la imagen compuesta
  const downloadLink = document.createElement("a");
  downloadLink.href = compositeImage;
  downloadLink.download = "qr_code_with_description.png"; // Nombre del archivo de descarga

  // Simular un clic en el enlace para iniciar la descarga
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
});
