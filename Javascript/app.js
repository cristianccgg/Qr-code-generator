document.addEventListener("DOMContentLoaded", () => {
  const qrContainer = document.getElementById("qr-container");
  const form = document.getElementById("form");
  const btn = document.getElementById("btn");
  const qrDescriptionInput = document.getElementById("input-description");
  const descriptionResult = document.getElementById("description-result");
  const downloadBtn = document.getElementById("downloadBtn");
  const input = document.getElementById("input");
  const msg = document.getElementById("error");

  const QR = new QRCode(qrContainer);

  const urlRegex =
    /^[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (btn.innerText === "GENERATE QR CODE" && urlRegex.test(input.value)) {
      QR.clear();
      QR.makeCode(form.input.value);
      descriptionResult.innerText = qrDescriptionInput.value;
      qrContainer.classList.remove("d-none");
      btn.innerText = "NEW QR CODE";
      msg.classList.add("d-none");
    } else if (btn.innerText === "GENERATE QR CODE") {
      msg.classList.remove("d-none");
      qrContainer.classList.add("d-none");
      btn.innerText = "GENERATE QR CODE";
      form.reset();
    } else {
      qrContainer.classList.add("d-none");
      btn.innerText = "GENERATE QR CODE";
      form.reset();
    }
  });

  btn.addEventListener("submit", () => {
    form.reset();
  });

  downloadBtn.addEventListener("click", () => {
    const qrImage = qrContainer.querySelector("img");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = qrImage.width;
    canvas.height = qrImage.height + 40;

    ctx.drawImage(qrImage, 0, 0);

    const description = qrDescriptionInput.value;
    ctx.font = "20px Arial";
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
});
