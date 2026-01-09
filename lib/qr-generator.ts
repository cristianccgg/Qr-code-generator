// Utilidades para generar códigos QR
import QRCode from "qrcode";

export interface GenerateQROptions {
  content: string; // Contenido ya procesado del QR
  color: string;
  backgroundColor?: string; // Color de fondo del QR
  size: number;
  description?: string;
  logo?: string; // Data URL del logo
}

export type QRFormat = "png" | "svg";

/**
 * Genera un código QR y lo retorna como Data URL
 */
export async function generateQRCode(
  options: GenerateQROptions
): Promise<string> {
  const { content, color, backgroundColor = "#ffffff", size, logo } = options;

  try {
    const qrDataURL = await QRCode.toDataURL(content, {
      width: size,
      color: {
        dark: color,
        light: backgroundColor,
      },
      errorCorrectionLevel: "H", // Alto nivel de corrección para permitir logo
      margin: 1,
    });

    // Si no hay logo, retornar el QR sin modificar
    if (!logo) {
      return qrDataURL;
    }

    // Si hay logo, agregarlo en el centro
    return await addLogoToQR(qrDataURL, logo, size);
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Agrega un logo en el centro del QR code
 */
async function addLogoToQR(
  qrDataURL: string,
  logoDataURL: string,
  size: number
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = size;
  canvas.height = size;

  // Cargar QR code
  const qrImage = new Image();
  qrImage.src = qrDataURL;
  await new Promise((resolve, reject) => {
    qrImage.onload = resolve;
    qrImage.onerror = reject;
  });

  // Dibujar QR code
  ctx.drawImage(qrImage, 0, 0, size, size);

  // Cargar logo
  const logoImage = new Image();
  logoImage.src = logoDataURL;
  await new Promise((resolve, reject) => {
    logoImage.onload = resolve;
    logoImage.onerror = reject;
  });

  // Calcular tamaño del logo (máximo 30% del QR)
  const logoSize = Math.min(size * 0.3, 150);
  const logoX = (size - logoSize) / 2;
  const logoY = (size - logoSize) / 2;

  // Fondo blanco para el logo (mejor visibilidad)
  const padding = 10;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, (logoSize + padding) / 2, 0, Math.PI * 2);
  ctx.fill();

  // Dibujar logo con bordes redondeados
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, logoSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

/**
 * Genera un código QR en formato SVG
 */
export async function generateQRCodeSVG(
  options: GenerateQROptions
): Promise<string> {
  const { content, color, backgroundColor = "#ffffff", size } = options;

  try {
    const svgString = await QRCode.toString(content, {
      type: "svg",
      width: size,
      color: {
        dark: color,
        light: backgroundColor,
      },
      errorCorrectionLevel: "H",
      margin: 1,
    });

    return svgString;
  } catch (error) {
    console.error("Error generating QR SVG:", error);
    throw new Error("Failed to generate QR SVG");
  }
}

/**
 * Descarga un SVG con descripción
 */
async function downloadSVGWithDescription(
  options: GenerateQROptions,
  filename: string
): Promise<void> {
  const {
    content,
    color,
    backgroundColor = "#ffffff",
    size,
    description,
  } = options;

  // Generar SVG del QR
  let svgString = await generateQRCodeSVG({
    content,
    color,
    backgroundColor,
    size,
  });

  // Extraer el viewBox original del QR generado
  const viewBoxMatch = svgString.match(/viewBox="([^"]*)"/);
  let viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${size} ${size}`;

  // Extraer las coordenadas del viewBox original
  const viewBoxParts = viewBox.split(" ").map(Number);
  const qrX = viewBoxParts[0] || 0;
  const qrY = viewBoxParts[1] || 0;
  const qrWidth = viewBoxParts[2] || size;
  const qrHeight = viewBoxParts[3] || size;

  // Si hay descripción, modificar el SVG para agregarla
  if (description) {
    // Mejor approach: incrustar el SVG original como una imagen dentro de
    // un SVG contenedor. Esto preserva la escala y el posicionamiento del
    // QR original y evita problemas con viewBox internos.
    const outputWidth = size;
    const fontSize = Math.max(8, Math.round(size * 0.046));
    const textHeight = Math.round(fontSize * 1.6);
    const padding = Math.round(fontSize * 0.6);
    const newHeight = outputWidth + textHeight + padding;

    // Generar una versión PNG rasterizada del QR (mejor para miniaturas)
    const pngDataURL = await QRCode.toDataURL(content, {
      width: size,
      color: {
        dark: color,
        light: backgroundColor,
      },
      errorCorrectionLevel: "H",
      margin: 1,
    });

    // Codificar el SVG original para usarlo como data URL (se colocará encima)
    const encoded = encodeURIComponent(svgString)
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");

    const imageHref = `data:image/svg+xml;utf8,${encoded}`;

    const textY = outputWidth + padding + Math.round(fontSize * 0.9);

    const container = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${newHeight}" viewBox="0 0 ${outputWidth} ${newHeight}">
        <rect width="100%" height="100%" fill="${backgroundColor}" />
        <!-- PNG raster de respaldo para que los thumbnailers muestren una miniatura correcta -->
        <image href="${pngDataURL}" x="0" y="0" width="${outputWidth}" height="${outputWidth}" preserveAspectRatio="xMidYMid slice" />
        <!-- SVG vector encima (mantiene calidad al abrir) -->
        <image href="${imageHref}" x="0" y="0" width="${outputWidth}" height="${outputWidth}" preserveAspectRatio="xMidYMid slice" />
        <text x="${outputWidth / 2}" y="${textY}"
          text-anchor="middle"
          fill="${color}"
          font-family="Arial, sans-serif"
          font-size="${fontSize}px"
          font-weight="bold">${description}</text>
      </svg>`;

    svgString = container;
  } else {
    // Sin descripción, solo asegurar que el SVG tenga dimensiones correctas
    svgString = svgString.replace(
      /<svg[^>]*>/,
      `<svg xmlns="http://www.w3.org/2000/svg" width="${qrWidth}" height="${qrHeight}" viewBox="${viewBox}">`
    );
  }

  // Crear blob y descargar
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url_blob = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url_blob;
  link.download = filename;
  link.click();

  // Limpiar
  URL.revokeObjectURL(url_blob);
}

/**
 * Descarga un PNG con descripción
 */
async function downloadPNGWithDescription(
  options: GenerateQROptions,
  filename: string
): Promise<void> {
  const { content, color, backgroundColor, size, description, logo } = options;

  // Generar QR code con logo incluido
  const qrDataURL = await generateQRCode({
    content,
    color,
    backgroundColor,
    size,
    logo,
  });

  // Crear canvas para agregar la descripción
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const img = new Image();
  img.src = qrDataURL;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const textHeight = description ? 40 : 0;
  canvas.width = size;
  canvas.height = size + textHeight;

  // Fondo con el color configurado
  ctx.fillStyle = backgroundColor || "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar QR code
  ctx.drawImage(img, 0, 0);

  // Dibujar descripción si existe
  if (description) {
    ctx.fillStyle = color; // Usar el mismo color del QR
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(description, size / 2, size + textHeight - 10);
  }

  // Descargar con mejor calidad
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png", 1.0); // Máxima calidad
  link.download = filename;
  link.click();
}

/**
 * Genera un código QR con descripción y lo descarga en el formato especificado
 */
export async function downloadQRCodeWithDescription(
  options: GenerateQROptions,
  format: QRFormat = "png"
): Promise<void> {
  try {
    // Generar nombre de archivo descriptivo
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const description = options.description
      ? `-${options.description.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`
      : "";
    const filename = `qrcode${description}_${timestamp}.${format}`;

    if (format === "svg") {
      await downloadSVGWithDescription(options, filename);
    } else {
      await downloadPNGWithDescription(options, filename);
    }
  } catch (error) {
    console.error("Error downloading QR code:", error);
    throw new Error("Failed to download QR code");
  }
}
