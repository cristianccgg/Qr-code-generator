// Tipos para el sistema de templates y frames de QR

import { DotStyle, CornerStyle, CornerDotStyle, GradientType } from './qr';

// Categorías de templates
export type TemplateCategory = 'general' | 'business' | 'social' | 'food' | 'events';

export const TEMPLATE_CATEGORIES: { label: string; value: TemplateCategory }[] = [
  { label: 'All', value: 'general' },
  { label: 'Business', value: 'business' },
  { label: 'Social', value: 'social' },
  { label: 'Food & Dining', value: 'food' },
  { label: 'Events', value: 'events' },
];

// Definición de un frame decorativo
export interface FrameDefinition {
  id: string;
  name: string;
  description: string;
  // Posición del QR dentro del frame (en porcentaje)
  qrArea: {
    x: number;      // % desde la izquierda
    y: number;      // % desde arriba
    width: number;  // % del ancho total
    height: number; // % del alto total
  };
  // Si el frame soporta texto personalizable
  hasCustomText: boolean;
  // Texto por defecto
  defaultText?: string;
  // Color por defecto del frame
  defaultColor: string;
  // Aspect ratio del frame (width/height), 1 = cuadrado
  aspectRatio: number;
}

// Configuración de estilos de QR (reutilizable)
export interface QRStyleConfig {
  color: string;
  backgroundColor: string;
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  cornerDotStyle: CornerDotStyle;
  cornerColor?: string;
  gradientEnabled: boolean;
  gradientType?: GradientType;
  gradientColorStart?: string;
  gradientColorEnd?: string;
  gradientRotation?: number;
}

// Template completo (para API y DB)
export interface QRTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  isSystem: boolean;
  category: TemplateCategory;

  // Estilos del QR
  style: QRStyleConfig;

  // Frame opcional
  frameId?: string;
  frameColor?: string;
  frameText?: string;

  // Metadata
  userId?: string;
  createdAt?: Date;
}

// Para UI de selección (versión ligera)
export interface TemplatePreview {
  id: string;
  name: string;
  thumbnail?: string;
  category: TemplateCategory;
  isSystem: boolean;
  hasFrame: boolean;
}

// Filtros para la galería de templates
export interface TemplateFilters {
  category?: TemplateCategory | 'all';
  hasFrame?: boolean;
  search?: string;
  showMyTemplates?: boolean;
}

// Opciones para renderizar QR con frame
export interface FrameRenderOptions {
  frameId: string;
  qrDataUrl: string;
  qrSize: number;
  frameColor?: string;
  frameText?: string;
  backgroundColor?: string;
}

// Response de la API de templates
export interface TemplatesAPIResponse {
  templates: QRTemplate[];
  total: number;
}

// Body para crear template
export interface CreateTemplateBody {
  name: string;
  description?: string;
  category?: TemplateCategory;
  style: QRStyleConfig;
  frameId?: string;
  frameColor?: string;
  frameText?: string;
}
