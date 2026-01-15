import { CSV_COLUMNS } from '@/types/bulk';

// Genera el contenido de la plantilla CSV
export function generateCSVTemplate(): string {
  const headers = [...CSV_COLUMNS.required, ...CSV_COLUMNS.optional];

  // Filas de ejemplo
  const exampleRows = [
    {
      type: 'url',
      content: 'https://example.com',
      description: 'Example Website',
      campaignId: '',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      size: '512',
      format: 'PNG',
      dotStyle: 'square',
      cornerStyle: 'square',
      cornerDotStyle: 'square',
      cornerColor: '',
      gradientEnabled: 'false',
      gradientType: '',
      gradientStart: '',
      gradientEnd: '',
      gradientRotation: '',
    },
    {
      type: 'url',
      content: 'https://google.com',
      description: 'Google Link',
      campaignId: '',
      color: '#f5576c',
      backgroundColor: '#FFFFFF',
      size: '512',
      format: 'PNG',
      dotStyle: 'rounded',
      cornerStyle: 'dot',
      cornerDotStyle: 'dot',
      cornerColor: '#f5576c',
      gradientEnabled: 'false',
      gradientType: '',
      gradientStart: '',
      gradientEnd: '',
      gradientRotation: '',
    },
    {
      type: 'email',
      content: 'contact@company.com',
      description: 'Contact Email',
      campaignId: '',
      color: '#4267B2',
      backgroundColor: '#FFFFFF',
      size: '256',
      format: 'PNG',
      dotStyle: 'dots',
      cornerStyle: 'square',
      cornerDotStyle: 'square',
      cornerColor: '',
      gradientEnabled: 'false',
      gradientType: '',
      gradientStart: '',
      gradientEnd: '',
      gradientRotation: '',
    },
    {
      type: 'text',
      content: '20% OFF - Summer Sale',
      description: 'Promo Code',
      campaignId: '',
      color: '#43e97b',
      backgroundColor: '#FFFFFF',
      size: '512',
      format: 'SVG',
      dotStyle: 'classy',
      cornerStyle: 'extra-rounded',
      cornerDotStyle: 'dot',
      cornerColor: '',
      gradientEnabled: 'true',
      gradientType: 'linear',
      gradientStart: '#43e97b',
      gradientEnd: '#38f9d7',
      gradientRotation: '45',
    },
    {
      type: 'phone',
      content: '+1234567890',
      description: 'Support Line',
      campaignId: '',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      size: '512',
      format: 'PNG',
      dotStyle: 'square',
      cornerStyle: 'square',
      cornerDotStyle: 'square',
      cornerColor: '',
      gradientEnabled: 'false',
      gradientType: '',
      gradientStart: '',
      gradientEnd: '',
      gradientRotation: '',
    },
  ];

  // Construir CSV
  const csvLines: string[] = [];

  // Header
  csvLines.push(headers.join(','));

  // Rows
  for (const row of exampleRows) {
    const values = headers.map(header => {
      const value = row[header as keyof typeof row] || '';
      // Escapar valores que contienen comas o comillas
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvLines.push(values.join(','));
  }

  return csvLines.join('\n');
}

// Descarga la plantilla CSV
export function downloadCSVTemplate(): void {
  const content = generateCSVTemplate();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'qr-bulk-template.csv';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Información de ayuda sobre las columnas
export const CSV_COLUMN_INFO = {
  type: {
    description: 'QR type',
    values: 'url, text, email, phone, sms, wifi, vcard',
    required: true,
  },
  content: {
    description: 'Main content for the QR code',
    values: 'URL, text, email address, phone number, etc.',
    required: true,
  },
  description: {
    description: 'Label/name for the QR code',
    values: 'Any text',
    required: false,
  },
  campaignId: {
    description: 'ID of an existing campaign',
    values: 'Campaign UUID',
    required: false,
  },
  color: {
    description: 'QR code color',
    values: 'Hex color (e.g., #000000)',
    required: false,
  },
  backgroundColor: {
    description: 'Background color',
    values: 'Hex color (e.g., #FFFFFF)',
    required: false,
  },
  size: {
    description: 'Size in pixels',
    values: '256, 512, 1024',
    required: false,
  },
  format: {
    description: 'Output format',
    values: 'PNG, SVG',
    required: false,
  },
  dotStyle: {
    description: 'Style of QR dots',
    values: 'square, dots, rounded, extra-rounded, classy, classy-rounded',
    required: false,
  },
  cornerStyle: {
    description: 'Style of corner squares',
    values: 'square, dot, extra-rounded',
    required: false,
  },
  cornerDotStyle: {
    description: 'Style of corner dots',
    values: 'square, dot',
    required: false,
  },
  cornerColor: {
    description: 'Corner color (disabled when gradient is enabled)',
    values: 'Hex color',
    required: false,
  },
  gradientEnabled: {
    description: 'Enable gradient',
    values: 'true, false',
    required: false,
  },
  gradientType: {
    description: 'Gradient type',
    values: 'linear, radial',
    required: false,
  },
  gradientStart: {
    description: 'Gradient start color',
    values: 'Hex color',
    required: false,
  },
  gradientEnd: {
    description: 'Gradient end color',
    values: 'Hex color',
    required: false,
  },
  gradientRotation: {
    description: 'Gradient rotation',
    values: '0-360',
    required: false,
  },
};
