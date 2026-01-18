// Templates del sistema predefinidos
// Estos se insertan en la base de datos mediante seed

import { QRStyleConfig, TemplateCategory } from '@/types/templates';

export interface SystemTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  style: QRStyleConfig;
  frameId?: string;
  frameColor?: string;
  frameText?: string;
}

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  // === General ===
  {
    id: 'classic-black',
    name: 'Classic Black',
    description: 'Timeless black and white QR code',
    category: 'general',
    style: {
      color: '#000000',
      backgroundColor: '#FFFFFF',
      dotStyle: 'square',
      cornerStyle: 'square',
      cornerDotStyle: 'square',
      gradientEnabled: false,
    },
  },
  {
    id: 'modern-dots',
    name: 'Modern Dots',
    description: 'Contemporary dot-style pattern',
    category: 'general',
    style: {
      color: '#1a1a1a',
      backgroundColor: '#FFFFFF',
      dotStyle: 'dots',
      cornerStyle: 'dot',
      cornerDotStyle: 'dot',
      gradientEnabled: false,
    },
  },
  {
    id: 'rounded-soft',
    name: 'Soft Rounded',
    description: 'Gentle rounded corners for a friendly look',
    category: 'general',
    style: {
      color: '#374151',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      gradientEnabled: false,
    },
  },
  {
    id: 'minimal-framed',
    name: 'Minimal Frame',
    description: 'Clean design with subtle border',
    category: 'general',
    style: {
      color: '#000000',
      backgroundColor: '#FFFFFF',
      dotStyle: 'square',
      cornerStyle: 'square',
      cornerDotStyle: 'square',
      gradientEnabled: false,
    },
    frameId: 'minimal-border',
    frameColor: '#000000',
  },

  // === Business ===
  {
    id: 'scan-to-pay-green',
    name: 'Scan to Pay',
    description: 'Perfect for payment QR codes',
    category: 'business',
    style: {
      color: '#22c55e',
      backgroundColor: '#FFFFFF',
      dotStyle: 'square',
      cornerStyle: 'square',
      cornerDotStyle: 'square',
      gradientEnabled: false,
    },
    frameId: 'scan-to-pay',
    frameColor: '#22c55e',
    frameText: 'SCAN TO PAY',
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional blue style',
    category: 'business',
    style: {
      color: '#1e40af',
      backgroundColor: '#FFFFFF',
      dotStyle: 'classy',
      cornerStyle: 'square',
      cornerDotStyle: 'square',
      gradientEnabled: false,
    },
  },
  {
    id: 'business-gradient',
    name: 'Business Gradient',
    description: 'Professional gradient from blue to purple',
    category: 'business',
    style: {
      color: '#3b82f6',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      gradientEnabled: true,
      gradientType: 'linear',
      gradientColorStart: '#3b82f6',
      gradientColorEnd: '#8b5cf6',
      gradientRotation: 135,
    },
  },

  // === Social ===
  {
    id: 'gradient-sunset',
    name: 'Sunset Gradient',
    description: 'Warm gradient from pink to orange',
    category: 'social',
    style: {
      color: '#f5576c',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      gradientEnabled: true,
      gradientType: 'linear',
      gradientColorStart: '#f5576c',
      gradientColorEnd: '#f093fb',
      gradientRotation: 45,
    },
  },
  {
    id: 'social-pink',
    name: 'Follow Us',
    description: 'Eye-catching social media style',
    category: 'social',
    style: {
      color: '#e91e63',
      backgroundColor: '#FFFFFF',
      dotStyle: 'dots',
      cornerStyle: 'dot',
      cornerDotStyle: 'dot',
      gradientEnabled: false,
    },
    frameId: 'social-follow',
    frameColor: '#e91e63',
    frameText: 'FOLLOW US',
  },
  {
    id: 'neon-gradient',
    name: 'Neon Vibes',
    description: 'Vibrant neon gradient',
    category: 'social',
    style: {
      color: '#06b6d4',
      backgroundColor: '#FFFFFF',
      dotStyle: 'extra-rounded',
      cornerStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      gradientEnabled: true,
      gradientType: 'radial',
      gradientColorStart: '#06b6d4',
      gradientColorEnd: '#a855f7',
      gradientRotation: 0,
    },
  },

  // === Food ===
  {
    id: 'restaurant-menu',
    name: 'Restaurant Menu',
    description: 'Perfect for restaurant table menus',
    category: 'food',
    style: {
      color: '#8538a6',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'extra-rounded',
      cornerDotStyle: 'square',
      gradientEnabled: false,
    },
    frameId: 'menu-frame',
    frameColor: '#8538a6',
    frameText: 'VIEW MENU',
  },
  {
    id: 'cafe-warm',
    name: 'Cafe Warm',
    description: 'Warm tones for coffee shops',
    category: 'food',
    style: {
      color: '#92400e',
      backgroundColor: '#FFFFFF',
      dotStyle: 'classy-rounded',
      cornerStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      gradientEnabled: true,
      gradientType: 'linear',
      gradientColorStart: '#92400e',
      gradientColorEnd: '#d97706',
      gradientRotation: 180,
    },
  },

  // === Events ===
  {
    id: 'wifi-blue',
    name: 'WiFi Connect',
    description: 'Share WiFi credentials easily',
    category: 'events',
    style: {
      color: '#3b82f6',
      backgroundColor: '#FFFFFF',
      dotStyle: 'rounded',
      cornerStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      gradientEnabled: false,
    },
    frameId: 'wifi-connect',
    frameColor: '#3b82f6',
    frameText: 'CONNECT TO WIFI',
  },
  {
    id: 'event-elegant',
    name: 'Elegant Event',
    description: 'Sophisticated style for special events',
    category: 'events',
    style: {
      color: '#000000',
      backgroundColor: '#FFFFFF',
      dotStyle: 'classy',
      cornerStyle: 'square',
      cornerDotStyle: 'square',
      cornerColor: '#d4af37',
      gradientEnabled: false,
    },
  },
  {
    id: 'scan-me-simple',
    name: 'Scan Me',
    description: 'Simple and clear call to action',
    category: 'events',
    style: {
      color: '#000000',
      backgroundColor: '#FFFFFF',
      dotStyle: 'square',
      cornerStyle: 'square',
      cornerDotStyle: 'square',
      gradientEnabled: false,
    },
    frameId: 'scan-me-basic',
    frameColor: '#000000',
    frameText: 'SCAN ME',
  },
];

/**
 * Obtiene un template del sistema por su ID
 */
export function getSystemTemplateById(id: string): SystemTemplate | undefined {
  return SYSTEM_TEMPLATES.find(t => t.id === id);
}

/**
 * Obtiene templates del sistema filtrados por categoría
 */
export function getSystemTemplatesByCategory(category: TemplateCategory): SystemTemplate[] {
  return SYSTEM_TEMPLATES.filter(t => t.category === category);
}
