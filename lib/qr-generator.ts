// Utilidades para generar códigos QR con estilos avanzados
import QRCodeStyling, {
  DotType,
  CornerSquareType,
  CornerDotType,
  GradientType,
  Options,
} from "qr-code-styling";
import type { DotStyle, CornerStyle, CornerDotStyle, GradientType as QRGradientType } from "@/types/qr";

export interface GenerateQROptions {
  content: string;
  color: string;
  backgroundColor?: string;
  size: number;
  description?: string;
  logo?: string;
  // Estilos avanzados
  dotStyle?: DotStyle;
  cornerStyle?: CornerStyle;
  cornerDotStyle?: CornerDotStyle;
  cornerColor?: string;
  // Gradientes
  gradientEnabled?: boolean;
  gradientType?: QRGradientType;
  gradientColorStart?: string;
  gradientColorEnd?: string;
  gradientRotation?: number;
}

export type QRFormat = "png" | "svg";

// Mapeo de estilos internos a tipos de la librería
const dotStyleMap: Record<DotStyle, DotType> = {
  'square': 'square',
  'dots': 'dots',
  'rounded': 'rounded',
  'extra-rounded': 'extra-rounded',
  'classy': 'classy',
  'classy-rounded': 'classy-rounded',
};

const cornerStyleMap: Record<CornerStyle, CornerSquareType> = {
  'square': 'square',
  'dot': 'dot',
  'extra-rounded': 'extra-rounded',
};

const cornerDotStyleMap: Record<CornerDotStyle, CornerDotType> = {
  'square': 'square',
  'dot': 'dot',
};

// Instancia global de QRCodeStyling para reutilizar
let qrCodeInstance: QRCodeStyling | null = null;

/**
 * Genera un código QR estilizado y lo retorna como Data URL
 */
export async function generateQRCode(
  options: GenerateQROptions
): Promise<string> {
  const {
    content,
    color,
    backgroundColor = "#ffffff",
    size,
    logo,
    dotStyle = 'square',
    cornerStyle = 'square',
    cornerDotStyle = 'square',
    cornerColor,
    gradientEnabled = false,
    gradientType = 'linear',
    gradientColorStart,
    gradientColorEnd,
    gradientRotation = 0,
  } = options;

  try {
    // Configurar opciones de dots
    const dotsOptions: Options['dotsOptions'] = {
      type: dotStyleMap[dotStyle],
    };

    // Si hay gradiente habilitado, usarlo para los dots
    if (gradientEnabled && gradientColorStart && gradientColorEnd) {
      dotsOptions.gradient = {
        type: gradientType as GradientType,
        rotation: (gradientRotation * Math.PI) / 180, // Convertir a radianes
        colorStops: [
          { offset: 0, color: gradientColorStart },
          { offset: 1, color: gradientColorEnd },
        ],
      };
    } else {
      dotsOptions.color = color;
    }

    // Configurar opciones de esquinas
    const cornersSquareOptions: Options['cornersSquareOptions'] = {
      type: cornerStyleMap[cornerStyle],
      color: cornerColor || color,
    };

    const cornersDotOptions: Options['cornersDotOptions'] = {
      type: cornerDotStyleMap[cornerDotStyle],
      color: cornerColor || color,
    };

    // Si hay gradiente, aplicarlo también a las esquinas
    if (gradientEnabled && gradientColorStart && gradientColorEnd) {
      const cornerGradient = {
        type: gradientType as GradientType,
        rotation: (gradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: gradientColorStart },
          { offset: 1, color: gradientColorEnd },
        ],
      };
      cornersSquareOptions.gradient = cornerGradient;
      cornersDotOptions.gradient = cornerGradient;
    }

    const qrOptions: Options = {
      width: size,
      height: size,
      data: content,
      margin: 10,
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      backgroundOptions: {
        color: backgroundColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
        imageSize: 0.4,
        hideBackgroundDots: true,
      },
    };

    // Agregar logo si existe
    if (logo) {
      qrOptions.image = logo;
    }

    // Crear nueva instancia (qr-code-styling no es muy eficiente reutilizando)
    qrCodeInstance = new QRCodeStyling(qrOptions);

    // Generar como blob y convertir a Data URL
    const rawData = await qrCodeInstance.getRawData("png");
    if (!rawData) {
      throw new Error("Failed to generate QR code blob");
    }

    // Convertir a Blob - qr-code-styling devuelve Blob en browser
    const blob = rawData as Blob;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert blob to data URL"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Genera un código QR en formato SVG
 */
export async function generateQRCodeSVG(
  options: GenerateQROptions
): Promise<string> {
  const {
    content,
    color,
    backgroundColor = "#ffffff",
    size,
    logo,
    dotStyle = 'square',
    cornerStyle = 'square',
    cornerDotStyle = 'square',
    cornerColor,
    gradientEnabled = false,
    gradientType = 'linear',
    gradientColorStart,
    gradientColorEnd,
    gradientRotation = 0,
  } = options;

  try {
    const dotsOptions: Options['dotsOptions'] = {
      type: dotStyleMap[dotStyle],
    };

    if (gradientEnabled && gradientColorStart && gradientColorEnd) {
      dotsOptions.gradient = {
        type: gradientType as GradientType,
        rotation: (gradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: gradientColorStart },
          { offset: 1, color: gradientColorEnd },
        ],
      };
    } else {
      dotsOptions.color = color;
    }

    const cornersSquareOptions: Options['cornersSquareOptions'] = {
      type: cornerStyleMap[cornerStyle],
      color: cornerColor || color,
    };

    const cornersDotOptions: Options['cornersDotOptions'] = {
      type: cornerDotStyleMap[cornerDotStyle],
      color: cornerColor || color,
    };

    if (gradientEnabled && gradientColorStart && gradientColorEnd) {
      const cornerGradient = {
        type: gradientType as GradientType,
        rotation: (gradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: gradientColorStart },
          { offset: 1, color: gradientColorEnd },
        ],
      };
      cornersSquareOptions.gradient = cornerGradient;
      cornersDotOptions.gradient = cornerGradient;
    }

    const qrOptions: Options = {
      width: size,
      height: size,
      data: content,
      margin: 10,
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      backgroundOptions: {
        color: backgroundColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
        imageSize: 0.4,
        hideBackgroundDots: true,
      },
    };

    if (logo) {
      qrOptions.image = logo;
    }

    const qrCode = new QRCodeStyling(qrOptions);
    const rawData = await qrCode.getRawData("svg");

    if (!rawData) {
      throw new Error("Failed to generate QR SVG blob");
    }

    // Convertir a Blob - qr-code-styling devuelve Blob en browser
    const blob = rawData as Blob;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert SVG blob to string"));
        }
      };
      reader.onerror = reject;
      reader.readAsText(blob);
    });
  } catch (error) {
    console.error("Error generating QR SVG:", error);
    throw new Error("Failed to generate QR SVG");
  }
}

/**
 * Descarga un QR con descripción opcional
 */
async function downloadWithDescription(
  options: GenerateQROptions,
  format: QRFormat,
  filename: string
): Promise<void> {
  const {
    content,
    color,
    backgroundColor = "#ffffff",
    size,
    description,
    logo,
    dotStyle = 'square',
    cornerStyle = 'square',
    cornerDotStyle = 'square',
    cornerColor,
    gradientEnabled = false,
    gradientType = 'linear',
    gradientColorStart,
    gradientColorEnd,
    gradientRotation = 0,
  } = options;

  // Si no hay descripción, descargar directamente
  if (!description) {
    const dotsOptions: Options['dotsOptions'] = {
      type: dotStyleMap[dotStyle],
    };

    if (gradientEnabled && gradientColorStart && gradientColorEnd) {
      dotsOptions.gradient = {
        type: gradientType as GradientType,
        rotation: (gradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: gradientColorStart },
          { offset: 1, color: gradientColorEnd },
        ],
      };
    } else {
      dotsOptions.color = color;
    }

    const cornersSquareOptions: Options['cornersSquareOptions'] = {
      type: cornerStyleMap[cornerStyle],
      color: cornerColor || color,
    };

    const cornersDotOptions: Options['cornersDotOptions'] = {
      type: cornerDotStyleMap[cornerDotStyle],
      color: cornerColor || color,
    };

    if (gradientEnabled && gradientColorStart && gradientColorEnd) {
      const cornerGradient = {
        type: gradientType as GradientType,
        rotation: (gradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: gradientColorStart },
          { offset: 1, color: gradientColorEnd },
        ],
      };
      cornersSquareOptions.gradient = cornerGradient;
      cornersDotOptions.gradient = cornerGradient;
    }

    const qrOptions: Options = {
      width: size,
      height: size,
      data: content,
      margin: 10,
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      backgroundOptions: {
        color: backgroundColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
        imageSize: 0.4,
        hideBackgroundDots: true,
      },
    };

    if (logo) {
      qrOptions.image = logo;
    }

    const qrCode = new QRCodeStyling(qrOptions);
    await qrCode.download({
      name: filename.replace(`.${format}`, ''),
      extension: format,
    });
    return;
  }

  // Con descripción, necesitamos agregar texto al canvas/svg
  if (format === 'png') {
    await downloadPNGWithDescription(options, filename);
  } else {
    await downloadSVGWithDescription(options, filename);
  }
}

/**
 * Descarga PNG con descripción
 */
async function downloadPNGWithDescription(
  options: GenerateQROptions,
  filename: string
): Promise<void> {
  const { size, description, color, backgroundColor = "#ffffff" } = options;

  // Generar QR como Data URL
  const qrDataURL = await generateQRCode(options);

  // Crear canvas para agregar descripción
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

  // Fondo
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibujar QR
  ctx.drawImage(img, 0, 0, size, size);

  // Dibujar descripción
  if (description) {
    ctx.fillStyle = color;
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(description, size / 2, size + textHeight - 10);
  }

  // Descargar
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png", 1.0);
  link.download = filename;
  link.click();
}

/**
 * Descarga SVG con descripción
 */
async function downloadSVGWithDescription(
  options: GenerateQROptions,
  filename: string
): Promise<void> {
  const { size, description, color, backgroundColor = "#ffffff" } = options;

  // Generar SVG
  const svgString = await generateQRCodeSVG(options);

  // Si hay descripción, agregar texto
  let finalSvg = svgString;
  if (description) {
    const fontSize = size * 0.05;
    const textHeight = fontSize * 1.8;
    const newHeight = size + textHeight;

    // Modificar el SVG para agregar texto
    finalSvg = svgString
      .replace(/height="[^"]*"/, `height="${newHeight}"`)
      .replace(/viewBox="([^"]*)"/, (match, viewBox) => {
        const parts = viewBox.split(' ');
        parts[3] = String(parseFloat(parts[3]) + textHeight);
        return `viewBox="${parts.join(' ')}"`;
      })
      .replace(
        '</svg>',
        `<text x="${size / 2}" y="${size + textHeight - 10}"
          text-anchor="middle"
          fill="${color}"
          font-family="Arial, sans-serif"
          font-size="${fontSize * 2}"
          font-weight="bold">${description}</text></svg>`
      );
  }

  // Descargar
  const blob = new Blob([finalSvg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Genera un código QR con descripción y lo descarga
 */
export async function downloadQRCodeWithDescription(
  options: GenerateQROptions,
  format: QRFormat = "png"
): Promise<void> {
  try {
    const timestamp = new Date().toISOString().split("T")[0];
    const description = options.description
      ? `-${options.description.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`
      : "";
    const filename = `qrcode${description}_${timestamp}.${format}`;

    await downloadWithDescription(options, format, filename);
  } catch (error) {
    console.error("Error downloading QR code:", error);
    throw new Error("Failed to download QR code");
  }
}
