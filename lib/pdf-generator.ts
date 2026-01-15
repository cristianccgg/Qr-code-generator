import { jsPDF } from 'jspdf';
import {
  SinglePDFOptions,
  LabelsPDFOptions,
  LabelLayout,
  LABEL_LAYOUTS,
  DEFAULT_SINGLE_PDF_OPTIONS,
} from '@/types/export';

// Dimensiones de página en mm
const PAGE_SIZES = {
  a4: { width: 210, height: 297 },
  letter: { width: 215.9, height: 279.4 },
};

/**
 * Genera un PDF con un solo QR centrado en la página
 */
export async function generateSingleQRPDF(
  qrDataUrl: string,
  description?: string,
  options: Partial<SinglePDFOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_SINGLE_PDF_OPTIONS, ...options };
  const pageSize = PAGE_SIZES[opts.pageSize];

  // Ajustar dimensiones según orientación
  const width = opts.orientation === 'portrait' ? pageSize.width : pageSize.height;
  const height = opts.orientation === 'portrait' ? pageSize.height : pageSize.width;

  const pdf = new jsPDF({
    orientation: opts.orientation,
    unit: 'mm',
    format: opts.pageSize,
  });

  // Calcular posición centrada
  const qrSize = opts.qrSize;
  const x = (width - qrSize) / 2;
  const y = (height - qrSize) / 2 - (description && opts.includeDescription ? 10 : 0);

  // Agregar QR
  pdf.addImage(qrDataUrl, 'PNG', x, y, qrSize, qrSize);

  // Agregar descripción
  if (description && opts.includeDescription) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    const textWidth = pdf.getTextWidth(description);
    const textX = (width - textWidth) / 2;
    pdf.text(description, textX, y + qrSize + 10);
  }

  // Agregar título si existe
  if (opts.title) {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const titleWidth = pdf.getTextWidth(opts.title);
    const titleX = (width - titleWidth) / 2;
    pdf.text(opts.title, titleX, y - 15);
  }

  return pdf.output('blob');
}

/**
 * Genera un PDF con múltiples QRs en formato de etiquetas
 */
export async function generateLabelsPDF(
  qrDataUrls: { dataUrl: string; description?: string }[],
  options: Partial<LabelsPDFOptions> = {}
): Promise<Blob> {
  const opts: LabelsPDFOptions = {
    pageSize: 'a4',
    layout: '2x4',
    includeDescription: true,
    ...options,
  };

  const layout = LABEL_LAYOUTS.find(l => l.id === opts.layout) || LABEL_LAYOUTS[1];
  const pageSize = PAGE_SIZES[opts.pageSize];

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: opts.pageSize,
  });

  const labelsPerPage = layout.labelsPerPage;
  let currentIndex = 0;
  let pageNumber = 0;

  while (currentIndex < qrDataUrls.length) {
    // Nueva página si no es la primera
    if (pageNumber > 0) {
      pdf.addPage();
    }

    // Dibujar etiquetas en esta página
    for (let row = 0; row < layout.rows && currentIndex < qrDataUrls.length; row++) {
      for (let col = 0; col < layout.cols && currentIndex < qrDataUrls.length; col++) {
        const qr = qrDataUrls[currentIndex];

        // Calcular posición de la etiqueta
        const x = layout.marginLeft + col * (layout.labelWidth + layout.gapX);
        const y = layout.marginTop + row * (layout.labelHeight + layout.gapY);

        // Espacio para texto si está habilitado
        const textHeight = opts.includeDescription ? 8 : 0;

        // Tamaño del QR - SIEMPRE el mismo, dejando espacio para texto
        const availableHeight = layout.labelHeight - textHeight - 4; // 4mm de padding
        const qrSize = Math.min(layout.labelWidth - 4, availableHeight) * 0.95;

        // Centrar QR horizontalmente, y verticalmente en el espacio disponible
        const qrX = x + (layout.labelWidth - qrSize) / 2;
        const qrY = y + 2 + (availableHeight - qrSize) / 2;

        // Dibujar borde de etiqueta (para guía de corte)
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.1);
        pdf.rect(x, y, layout.labelWidth, layout.labelHeight);

        // Agregar QR
        pdf.addImage(qr.dataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

        // Agregar descripción (siempre en la misma posición relativa)
        if (opts.includeDescription && qr.description) {
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(60, 60, 60);

          // Truncar texto si es muy largo
          let text = qr.description;
          const maxWidth = layout.labelWidth - 4;
          while (pdf.getTextWidth(text) > maxWidth && text.length > 3) {
            text = text.slice(0, -4) + '...';
          }

          const textWidth = pdf.getTextWidth(text);
          const textX = x + (layout.labelWidth - textWidth) / 2;
          // Texto justo debajo del QR
          const textY = qrY + qrSize + 5;
          pdf.text(text, textX, textY);
        }

        currentIndex++;
      }
    }

    pageNumber++;
  }

  return pdf.output('blob');
}

/**
 * Genera un PDF con múltiples páginas, un QR por página
 */
export async function generateMultiPagePDF(
  qrDataUrls: { dataUrl: string; description?: string }[],
  options: Partial<SinglePDFOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_SINGLE_PDF_OPTIONS, ...options };
  const pageSize = PAGE_SIZES[opts.pageSize];

  const width = opts.orientation === 'portrait' ? pageSize.width : pageSize.height;
  const height = opts.orientation === 'portrait' ? pageSize.height : pageSize.width;

  const pdf = new jsPDF({
    orientation: opts.orientation,
    unit: 'mm',
    format: opts.pageSize,
  });

  qrDataUrls.forEach((qr, index) => {
    if (index > 0) {
      pdf.addPage();
    }

    const qrSize = opts.qrSize;
    const x = (width - qrSize) / 2;
    const y = (height - qrSize) / 2 - (qr.description && opts.includeDescription ? 10 : 0);

    // Agregar QR
    pdf.addImage(qr.dataUrl, 'PNG', x, y, qrSize, qrSize);

    // Agregar descripción
    if (qr.description && opts.includeDescription) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const textWidth = pdf.getTextWidth(qr.description);
      const textX = (width - textWidth) / 2;
      pdf.text(qr.description, textX, y + qrSize + 10);
    }

    // Agregar número de página
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`${index + 1} / ${qrDataUrls.length}`, width - 20, height - 10);
  });

  return pdf.output('blob');
}

/**
 * Descarga un Blob como archivo
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera y descarga PDF individual
 */
export async function downloadSingleQRPDF(
  qrDataUrl: string,
  description?: string,
  filename: string = 'qr-code.pdf',
  options: Partial<SinglePDFOptions> = {}
): Promise<void> {
  const blob = await generateSingleQRPDF(qrDataUrl, description, options);
  downloadBlob(blob, filename);
}

/**
 * Genera y descarga PDF de etiquetas
 */
export async function downloadLabelsPDF(
  qrDataUrls: { dataUrl: string; description?: string }[],
  filename: string = 'qr-labels.pdf',
  options: Partial<LabelsPDFOptions> = {}
): Promise<void> {
  const blob = await generateLabelsPDF(qrDataUrls, options);
  downloadBlob(blob, filename);
}

/**
 * Genera y descarga PDF multipágina
 */
export async function downloadMultiPagePDF(
  qrDataUrls: { dataUrl: string; description?: string }[],
  filename: string = 'qr-codes.pdf',
  options: Partial<SinglePDFOptions> = {}
): Promise<void> {
  const blob = await generateMultiPagePDF(qrDataUrls, options);
  downloadBlob(blob, filename);
}
