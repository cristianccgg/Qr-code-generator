document.addEventListener("DOMContentLoaded", () => {
  const qrContainer = document.getElementById("qr-container");
  const form = document.getElementById("form");
  const btn = document.getElementById("btn");
  const qrDescriptionInput = document.getElementById("input-description");
  const descriptionResult = document.getElementById("description-result");
  const downloadBtn = document.getElementById("downloadBtn");
  const input = document.getElementById("input");
  const msg = document.getElementById("error");
  const colorSelect = document.getElementById("color");
  const sizeSelect = document.getElementById("size");

  function generateQRCode(url, color) {
    qrContainer.innerHTML = "";

    // Crear una nueva instancia de QRCode con el tamaño de previsualización fijo (medium)
    const QR = new QRCode(qrContainer, {
      text: url,
      width: 200,
      height: 200,
      colorDark: color,
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    // Mostrar el texto de la descripción (si está disponible)
    descriptionResult.innerText = qrDescriptionInput.value;
  }

  // Generar automáticamente el código QR al cargar la página
  generateQRCode("https://example.com", colorSelect.value);

  // Escuchar los eventos de cambio en el selector de color
  colorSelect.addEventListener("change", () => {
    generateQRCode(input.value || "https://example.com", colorSelect.value);
  });

  // Evento de envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (btn.innerText === "APPLY CHANGES") {
      // Generar el código QR con el color seleccionado
      generateQRCode(input.value || "https://example.com", colorSelect.value);

      // Ocultar el mensaje de error
      msg.classList.add("d-none");
    } else if (btn.innerText === "NEW QR CODE") {
      // Restablecer el formulario
      form.reset();

      // Ocultar el contenedor QR
      qrContainer.classList.add("d-none");

      // Cambiar el texto del botón
      btn.innerText = "GENERATE QR CODE";
    }
  });

  // Evento de descarga del código QR
  downloadBtn.addEventListener("click", () => {
    // Obtener el tamaño seleccionado para la descarga
    const selectedSize = sizeSelect.value;

    // Generar el código QR con el color seleccionado y el tamaño de descarga
    const QR = new QRCode(qrContainer, {
      text: input.value || "https://example.com",
      width: selectedSize,
      height: selectedSize,
      colorDark: colorSelect.value,
      colorLight: "#ffffff", // Opcional: color claro predeterminado
      correctLevel: QRCode.CorrectLevel.H,
    });

    // Mostrar el texto de la descripción (si está disponible)
    descriptionResult.innerText = qrDescriptionInput.value;

    // Convertir el contenedor QR en una imagen
    const qrImage = qrContainer.querySelector("img");

    // Crear un canvas para combinar el código QR con la descripción
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = qrImage.width;
    canvas.height = qrImage.height + 40;
    ctx.drawImage(qrImage, 0, 0);

    // Agregar la descripción encima del código QR
    const description = qrDescriptionInput.value;
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    const textWidth = ctx.measureText(description).width;
    const textX = (canvas.width - textWidth) / 2;
    ctx.fillText(description, textX, qrImage.height + 25);

    // Convertir el canvas en una imagen
    const compositeImage = canvas.toDataURL("image/png");

    // Crear un enlace de descarga y simular un clic para descargar la imagen
    const downloadLink = document.createElement("a");
    downloadLink.href = compositeImage;
    downloadLink.download = "qr_code_with_description.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });
});
