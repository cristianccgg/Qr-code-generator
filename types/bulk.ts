import { QRType, QRFormat, DotStyle, CornerStyle, CornerDotStyle, GradientType } from './qr';

// Estados del componente BulkUploader
export type BulkState =
  | 'idle'        // Esperando upload
  | 'parsing'     // Parseando CSV
  | 'preview'     // Mostrando preview
  | 'generating'  // Generando QRs
  | 'complete'    // Proceso completo
  | 'error';      // Error fatal

// Item individual del CSV transformado
export interface BulkQRItem {
  type: QRType;
  content: string;
  description?: string;
  campaignId?: string;
  color?: string;
  backgroundColor?: string;
  size?: number;
  format?: QRFormat;
  dotStyle?: DotStyle;
  cornerStyle?: CornerStyle;
  cornerDotStyle?: CornerDotStyle;
  cornerColor?: string;
  gradientEnabled?: boolean;
  gradientType?: GradientType;
  gradientStart?: string;
  gradientEnd?: string;
  gradientRotation?: number;
}

// Fila parseada del CSV con estado de validación
export interface ParsedCSVRow {
  index: number;
  data: Record<string, string>;
  isValid: boolean;
  errors: string[];
  item?: BulkQRItem; // Solo si isValid
}

// Request al endpoint bulk-create
export interface BulkCreateRequest {
  items: BulkQRItem[];
  skipInvalid?: boolean;
}

// QR creado exitosamente
export interface BulkQRCreated {
  id: string;
  shortId: string;
  shortUrl: string;
  description?: string;
  index: number;
}

// QR que falló
export interface BulkQRFailed {
  index: number;
  error: string;
}

// Response del endpoint bulk-create
export interface BulkCreateResponse {
  success: boolean;
  created: BulkQRCreated[];
  failed: BulkQRFailed[];
  totalCreated: number;
  totalFailed: number;
}

// Estado de progreso
export interface BulkProgress {
  current: number;
  total: number;
  currentItem?: string;
}

// Resultado de validación de una fila
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Columnas válidas del CSV
export const CSV_COLUMNS = {
  required: ['type', 'content'] as const,
  optional: [
    'description',
    'campaignId',
    'color',
    'backgroundColor',
    'size',
    'format',
    'dotStyle',
    'cornerStyle',
    'cornerDotStyle',
    'cornerColor',
    'gradientEnabled',
    'gradientType',
    'gradientStart',
    'gradientEnd',
    'gradientRotation',
  ] as const,
};

// Valores válidos para campos enum
export const VALID_VALUES = {
  type: ['url', 'text', 'email', 'phone', 'sms', 'wifi', 'vcard'] as const,
  format: ['png', 'svg', 'PNG', 'SVG'] as const,
  size: [256, 512, 1024] as const,
  dotStyle: ['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'] as const,
  cornerStyle: ['square', 'dot', 'extra-rounded'] as const,
  cornerDotStyle: ['square', 'dot'] as const,
  gradientType: ['linear', 'radial'] as const,
};

// Límites
export const BULK_LIMITS = {
  maxItems: 100,
  maxFileSize: 1024 * 1024, // 1MB
  batchSize: 10,
};
