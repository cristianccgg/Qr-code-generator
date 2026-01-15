// Tipos para exportación profesional de QR codes

// Tamaños de página PDF
export type PDFPageSize = 'a4' | 'letter';

// Orientación de página
export type PDFOrientation = 'portrait' | 'landscape';

// Layouts de etiquetas predefinidos
export type LabelLayout = '2x2' | '2x4' | '3x5' | '4x6';

// Formatos de exportación
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'zip';

// Configuración de un layout de etiquetas
export interface LabelLayoutConfig {
  id: LabelLayout;
  name: string;
  description: string;
  cols: number;
  rows: number;
  labelsPerPage: number;
  // Dimensiones en mm
  labelWidth: number;
  labelHeight: number;
  marginTop: number;
  marginLeft: number;
  gapX: number;
  gapY: number;
}

// Layouts disponibles
export const LABEL_LAYOUTS: LabelLayoutConfig[] = [
  {
    id: '2x2',
    name: '2x2 Large',
    description: '4 labels per page - Posters',
    cols: 2,
    rows: 2,
    labelsPerPage: 4,
    labelWidth: 90,
    labelHeight: 120,
    marginTop: 15,
    marginLeft: 15,
    gapX: 10,
    gapY: 10,
  },
  {
    id: '2x4',
    name: '2x4 Medium',
    description: '8 labels per page - Business cards',
    cols: 2,
    rows: 4,
    labelsPerPage: 8,
    labelWidth: 85,
    labelHeight: 60,
    marginTop: 15,
    marginLeft: 20,
    gapX: 10,
    gapY: 10,
  },
  {
    id: '3x5',
    name: '3x5 Small',
    description: '15 labels per page - Small labels',
    cols: 3,
    rows: 5,
    labelsPerPage: 15,
    labelWidth: 60,
    labelHeight: 50,
    marginTop: 10,
    marginLeft: 15,
    gapX: 5,
    gapY: 5,
  },
  {
    id: '4x6',
    name: '4x6 Mini',
    description: '24 labels per page - Product labels',
    cols: 4,
    rows: 6,
    labelsPerPage: 24,
    labelWidth: 45,
    labelHeight: 40,
    marginTop: 10,
    marginLeft: 10,
    gapX: 5,
    gapY: 5,
  },
];

// Opciones para generar PDF individual
export interface SinglePDFOptions {
  pageSize: PDFPageSize;
  orientation: PDFOrientation;
  includeDescription: boolean;
  qrSize: number; // tamaño del QR en mm
  title?: string;
}

// Opciones para generar PDF de etiquetas
export interface LabelsPDFOptions {
  pageSize: PDFPageSize;
  layout: LabelLayout;
  includeDescription: boolean;
}

// Opciones para batch export
export interface BatchExportOptions {
  format: 'zip' | 'pdf';
  imageFormat?: 'png' | 'svg'; // solo para ZIP
  includeDescription: boolean;
}

// Item para exportar (QR del dashboard)
export interface ExportableQR {
  id: string;
  shortId: string;
  shortUrl: string;
  description?: string;
  destinationUrl?: string;
  // Estilos para regenerar el QR
  color: string;
  backgroundColor: string;
  size: number;
  dotStyle?: string;
  cornerStyle?: string;
  cornerDotStyle?: string;
  cornerColor?: string;
  gradientEnabled?: boolean;
  gradientType?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientRotation?: number;
}

// Defaults
export const DEFAULT_SINGLE_PDF_OPTIONS: SinglePDFOptions = {
  pageSize: 'a4',
  orientation: 'portrait',
  includeDescription: true,
  qrSize: 100,
};

export const DEFAULT_LABELS_PDF_OPTIONS: LabelsPDFOptions = {
  pageSize: 'a4',
  layout: '2x4',
  includeDescription: true,
};

export const DEFAULT_BATCH_OPTIONS: BatchExportOptions = {
  format: 'zip',
  imageFormat: 'png',
  includeDescription: false,
};
