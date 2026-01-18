// Frame Renderer - Compone QR codes con frames decorativos

import { FrameRenderOptions } from '@/types/templates';
import { getFrameById } from './frames';
import { generateFrameSVG } from './frames/svg-templates';

/**
 * Carga una imagen desde una URL o data URL
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/**
 * Convierte un SVG string a una imagen
 */
async function svgToImage(svg: string, width: number, height: number): Promise<HTMLImageElement> {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Renderiza un QR code con frame como PNG usando Canvas API
 * @returns Data URL del PNG resultante
 */
export async function renderWithFramePNG(options: FrameRenderOptions): Promise<string> {
  const {
    frameId,
    qrDataUrl,
    qrSize,
    frameColor,
    frameText,
    backgroundColor = '#FFFFFF',
  } = options;

  const frame = getFrameById(frameId);
  if (!frame) {
    // Sin frame, retornar QR original
    return qrDataUrl;
  }

  // Calcular dimensiones del canvas final basado en aspect ratio del frame
  // El QR ocupa un % del frame según qrArea
  const frameWidth = Math.round(qrSize / (frame.qrArea.width / 100));
  const frameHeight = Math.round(frameWidth * frame.aspectRatio);

  // Crear canvas
  const canvas = document.createElement('canvas');
  canvas.width = frameWidth;
  canvas.height = frameHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Generar y dibujar frame SVG
  const frameSvg = generateFrameSVG(frameId, {
    width: frameWidth,
    height: frameHeight,
    color: frameColor || frame.defaultColor,
    text: frameText || frame.defaultText || '',
    backgroundColor,
  });

  if (frameSvg) {
    const frameImg = await svgToImage(frameSvg, frameWidth, frameHeight);
    ctx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);
  } else {
    // Fallback: solo fondo blanco
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, frameWidth, frameHeight);
  }

  // 2. Dibujar QR en la posición correcta
  const qrImg = await loadImage(qrDataUrl);
  const qrX = (frame.qrArea.x / 100) * frameWidth;
  const qrY = (frame.qrArea.y / 100) * frameHeight;
  const qrW = (frame.qrArea.width / 100) * frameWidth;
  const qrH = (frame.qrArea.height / 100) * frameHeight;

  ctx.drawImage(qrImg, qrX, qrY, qrW, qrH);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Renderiza un QR code con frame como SVG
 * @returns SVG string del resultado
 */
export async function renderWithFrameSVG(options: FrameRenderOptions): Promise<string> {
  const {
    frameId,
    qrDataUrl,
    qrSize,
    frameColor,
    frameText,
    backgroundColor = '#FFFFFF',
  } = options;

  const frame = getFrameById(frameId);
  if (!frame) {
    // Sin frame, retornar QR como SVG con imagen embebida
    return `<svg viewBox="0 0 ${qrSize} ${qrSize}" xmlns="http://www.w3.org/2000/svg">
      <image href="${qrDataUrl}" width="${qrSize}" height="${qrSize}"/>
    </svg>`;
  }

  // Calcular dimensiones
  const frameWidth = Math.round(qrSize / (frame.qrArea.width / 100));
  const frameHeight = Math.round(frameWidth * frame.aspectRatio);

  // Posición del QR
  const qrX = (frame.qrArea.x / 100) * frameWidth;
  const qrY = (frame.qrArea.y / 100) * frameHeight;
  const qrW = (frame.qrArea.width / 100) * frameWidth;
  const qrH = (frame.qrArea.height / 100) * frameHeight;

  // Generar frame SVG
  const frameSvg = generateFrameSVG(frameId, {
    width: frameWidth,
    height: frameHeight,
    color: frameColor || frame.defaultColor,
    text: frameText || frame.defaultText || '',
    backgroundColor,
  });

  // Extraer contenido interno del frame SVG (sin el tag <svg> exterior)
  const frameContent = frameSvg
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '');

  // Componer SVG final
  return `<svg viewBox="0 0 ${frameWidth} ${frameHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Frame decorations -->
    ${frameContent}
    <!-- QR Code -->
    <image x="${qrX}" y="${qrY}" width="${qrW}" height="${qrH}" href="${qrDataUrl}"/>
  </svg>`;
}

/**
 * Calcula las dimensiones finales con frame
 */
export function getFrameDimensions(
  frameId: string,
  qrSize: number
): { width: number; height: number } {
  const frame = getFrameById(frameId);
  if (!frame) {
    return { width: qrSize, height: qrSize };
  }

  const frameWidth = Math.round(qrSize / (frame.qrArea.width / 100));
  const frameHeight = Math.round(frameWidth * frame.aspectRatio);

  return { width: frameWidth, height: frameHeight };
}
