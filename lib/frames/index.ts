// Definiciones de frames predefinidos para QR codes

import { FrameDefinition } from '@/types/templates';

export const PREDEFINED_FRAMES: FrameDefinition[] = [
  {
    id: 'scan-me-basic',
    name: 'Scan Me',
    description: 'Simple frame with "SCAN ME" text below',
    qrArea: { x: 10, y: 8, width: 80, height: 68 },
    hasCustomText: true,
    defaultText: 'SCAN ME',
    defaultColor: '#000000',
    aspectRatio: 1.18, // Más alto para el texto
  },
  {
    id: 'scan-to-pay',
    name: 'Scan to Pay',
    description: 'Payment-style frame with money icon',
    qrArea: { x: 10, y: 15, width: 80, height: 65 },
    hasCustomText: true,
    defaultText: 'SCAN TO PAY',
    defaultColor: '#22c55e',
    aspectRatio: 1.2,
  },
  {
    id: 'menu-frame',
    name: 'Menu',
    description: 'Restaurant menu style with utensils',
    qrArea: { x: 10, y: 15, width: 80, height: 65 },
    hasCustomText: true,
    defaultText: 'VIEW MENU',
    defaultColor: '#8538a6',
    aspectRatio: 1.2,
  },
  {
    id: 'wifi-connect',
    name: 'WiFi',
    description: 'WiFi connection frame with signal icon',
    qrArea: { x: 10, y: 15, width: 80, height: 65 },
    hasCustomText: true,
    defaultText: 'CONNECT TO WIFI',
    defaultColor: '#3b82f6',
    aspectRatio: 1.2,
  },
  {
    id: 'social-follow',
    name: 'Follow Us',
    description: 'Social media style frame',
    qrArea: { x: 10, y: 15, width: 80, height: 65 },
    hasCustomText: true,
    defaultText: 'FOLLOW US',
    defaultColor: '#e91e63',
    aspectRatio: 1.2,
  },
  {
    id: 'minimal-border',
    name: 'Minimal',
    description: 'Clean rounded border, no text',
    qrArea: { x: 8, y: 8, width: 84, height: 84 },
    hasCustomText: false,
    defaultColor: '#000000',
    aspectRatio: 1,
  },
];

/**
 * Obtiene un frame por su ID
 */
export function getFrameById(id: string): FrameDefinition | undefined {
  return PREDEFINED_FRAMES.find(frame => frame.id === id);
}

/**
 * Obtiene todos los frames disponibles
 */
export function getAllFrames(): FrameDefinition[] {
  return PREDEFINED_FRAMES;
}
