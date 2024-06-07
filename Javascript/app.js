document.addEventListener("DOMContentLoaded", () => {
  const qrContainer = document.getElementById("qr-code");
  const qrDescriptionInput = document.getElementById("input-description");
  const downloadBtn = document.getElementById("downloadBtn");
  const input = document.getElementById("input");
  const colorSelect = document.getElementById("color");
  const sizeSelect = document.getElementById("size");
  const sizeText = document.getElementById("sizeText");
  const applyChanges = document.getElementById("btn-changes");
  const descriptionResult = document.getElementById("description-result");

  const sizeLabels = {
    128: "Small",
    256: "Medium",
    512: "Large",
  };

  const previewSize = 200; // Tamaño fijo para la vista previa

  // Función para generar QR Code
  function generateQRCode(url, color, size) {
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
      text: url,
      width: size,
      height: size,
      colorDark: color,
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  }

  // Generar QR Code de vista previa con tamaño fijo
  generateQRCode("https://example.com", colorSelect.value, previewSize);

  // Actualizar color en tiempo real
  colorSelect.addEventListener("change", () => {
    generateQRCode(
      input.value || "https://example.com",
      colorSelect.value,
      previewSize
    );
  });

  // Evento del botón Apply Changes
  applyChanges.addEventListener("click", () => {
    const url = input.value || "https://example.com";
    const color = colorSelect.value;
    descriptionResult.innerText = qrDescriptionInput.value;
    generateQRCode(url, color, previewSize);
  });

  // Actualizar tamaño en el texto
  sizeSelect.addEventListener("change", () => {
    const selectedSize = sizeSelect.value;
    const sizeLabel = sizeLabels[selectedSize];
    sizeText.innerText = `${sizeLabel} (${selectedSize}px * ${selectedSize}px)`;
  });

  // --------------------------------------------------------------

  // Función para generar y descargar QR Code con el tamaño seleccionado y la descripción
  function downloadQRCodeWithDescription(url, color, size, description) {
    const tempContainer = document.createElement("div");
    new QRCode(tempContainer, {
      text: url,
      width: size,
      height: size,
      colorDark: color,
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    const qrCanvas = tempContainer.querySelector("canvas");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const textHeight = 40; // Adjust as needed
    canvas.width = size;
    canvas.height = size + textHeight;

    // Draw QR code on the new canvas
    ctx.drawImage(qrCanvas, 0, 0);

    // Draw the description text below the QR code
    ctx.fillStyle = "#000000"; // Text color
    ctx.font = "24px Arial"; // Font settings
    ctx.textAlign = "center";
    ctx.fillText(description, size / 2, size + textHeight - 10);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qrcode_with_description.png";
    link.click();
  }

  // Evento del botón Download
  downloadBtn.addEventListener("click", () => {
    const url = input.value || "https://example.com";
    const color = colorSelect.value;
    const size = parseInt(sizeSelect.value);
    const description = qrDescriptionInput.value;
    downloadQRCodeWithDescription(url, color, size, description);
  });
});
