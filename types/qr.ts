// Tipos para el generador de QR
// TypeScript nos ayuda a definir qué propiedades tienen nuestros objetos

export type QRFormat = 'png' | 'svg';

export type QRType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard';

export interface QRConfig {
  type: QRType;
  url: string;
  description: string;
  color: string;
  backgroundColor?: string; // Color de fondo del QR
  size: number;
  format: QRFormat;
  // Logo/imagen en centro
  logo?: string; // Data URL de la imagen
  // Campaña (opcional)
  campaignId?: string;
  // Campos específicos para cada tipo
  text?: string;
  email?: string;
  phone?: string;
  sms?: string;
  wifiSSID?: string;
  wifiPassword?: string;
  wifiEncryption?: 'WPA' | 'WEP' | 'nopass';
  vcardName?: string;
  vcardPhone?: string;
  vcardEmail?: string;
  vcardOrganization?: string;
}

export interface QRColorOption {
  label: string;
  value: string;
}

export interface QRSizeOption {
  label: string;
  value: number;
}

export const QR_COLORS: QRColorOption[] = [
  { label: 'Black', value: '#000000' },
  { label: 'Design 1', value: '#f5576c' },
  { label: 'Design 2', value: '#8538a6' },
  { label: 'Design 3', value: '#7386bf' },
  { label: 'Design 4', value: '#f2cb57' },
  { label: 'Design 5', value: '#40B49D' },
];

export const QR_SIZES: QRSizeOption[] = [
  { label: 'Small (256px)', value: 256 },
  { label: 'Medium (512px)', value: 512 },
  { label: 'Large (1024px)', value: 1024 },
];

export interface QRFormatOption {
  label: string;
  value: QRFormat;
  description: string;
}

export const QR_FORMATS: QRFormatOption[] = [
  { label: 'PNG', value: 'png', description: 'Best for web and social media' },
  { label: 'SVG', value: 'svg', description: 'Best for print and scalability' },
];

export interface QRTypeOption {
  label: string;
  value: QRType;
  description: string;
}

export const QR_TYPES: QRTypeOption[] = [
  { label: 'URL/Website', value: 'url', description: 'Link to a website' },
  { label: 'Plain Text', value: 'text', description: 'Any text content' },
  { label: 'Email', value: 'email', description: 'Send an email' },
  { label: 'Phone', value: 'phone', description: 'Make a phone call' },
  { label: 'SMS', value: 'sms', description: 'Send a text message' },
  { label: 'WiFi', value: 'wifi', description: 'Connect to WiFi' },
  { label: 'Contact (vCard)', value: 'vcard', description: 'Save contact info' },
];
