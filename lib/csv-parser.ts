import Papa from 'papaparse';
import {
  BulkQRItem,
  ParsedCSVRow,
  ValidationResult,
  CSV_COLUMNS,
  VALID_VALUES,
  BULK_LIMITS,
} from '@/types/bulk';
import { QRType, QRFormat, DotStyle, CornerStyle, CornerDotStyle, GradientType } from '@/types/qr';

// Regex para validación
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i;

// Validar un campo individual
function validateField(
  field: string,
  value: string,
  row: Record<string, string>
): ValidationResult {
  // Campos requeridos
  if (field === 'type') {
    if (!value) return { valid: false, error: 'Type is required' };
    if (!VALID_VALUES.type.includes(value.toLowerCase() as QRType)) {
      return {
        valid: false,
        error: `Invalid type "${value}". Must be one of: ${VALID_VALUES.type.join(', ')}`,
      };
    }
    return { valid: true };
  }

  if (field === 'content') {
    if (!value) return { valid: false, error: 'Content is required' };

    // Validación específica por tipo
    const type = row.type?.toLowerCase();
    if (type === 'url' && !URL_REGEX.test(value)) {
      return { valid: false, error: 'Invalid URL format' };
    }
    if (type === 'email' && !EMAIL_REGEX.test(value)) {
      return { valid: false, error: 'Invalid email format' };
    }
    if (type === 'phone' && !/^[+\d\s()-]{7,20}$/.test(value)) {
      return { valid: false, error: 'Invalid phone format' };
    }
    return { valid: true };
  }

  // Campos opcionales - solo validar si tienen valor
  if (!value) return { valid: true };

  if (field === 'color' || field === 'backgroundColor' || field === 'cornerColor' ||
      field === 'gradientStart' || field === 'gradientEnd') {
    if (!HEX_COLOR_REGEX.test(value)) {
      return { valid: false, error: `${field} must be hex format (e.g., #FF0000)` };
    }
    return { valid: true };
  }

  if (field === 'size') {
    const num = parseInt(value);
    if (!VALID_VALUES.size.includes(num as 256 | 512 | 1024)) {
      return { valid: false, error: 'Size must be 256, 512, or 1024' };
    }
    return { valid: true };
  }

  if (field === 'format') {
    if (!VALID_VALUES.format.includes(value.toUpperCase() as 'PNG' | 'SVG')) {
      return { valid: false, error: 'Format must be PNG or SVG' };
    }
    return { valid: true };
  }

  if (field === 'dotStyle') {
    if (!VALID_VALUES.dotStyle.includes(value as DotStyle)) {
      return {
        valid: false,
        error: `Invalid dotStyle. Must be one of: ${VALID_VALUES.dotStyle.join(', ')}`,
      };
    }
    return { valid: true };
  }

  if (field === 'cornerStyle') {
    if (!VALID_VALUES.cornerStyle.includes(value as CornerStyle)) {
      return {
        valid: false,
        error: `Invalid cornerStyle. Must be one of: ${VALID_VALUES.cornerStyle.join(', ')}`,
      };
    }
    return { valid: true };
  }

  if (field === 'cornerDotStyle') {
    if (!VALID_VALUES.cornerDotStyle.includes(value as CornerDotStyle)) {
      return {
        valid: false,
        error: `Invalid cornerDotStyle. Must be one of: ${VALID_VALUES.cornerDotStyle.join(', ')}`,
      };
    }
    return { valid: true };
  }

  if (field === 'gradientEnabled') {
    if (!['true', 'false', '1', '0', ''].includes(value.toLowerCase())) {
      return { valid: false, error: 'gradientEnabled must be true or false' };
    }
    return { valid: true };
  }

  if (field === 'gradientType') {
    if (!VALID_VALUES.gradientType.includes(value as GradientType)) {
      return {
        valid: false,
        error: `Invalid gradientType. Must be one of: ${VALID_VALUES.gradientType.join(', ')}`,
      };
    }
    return { valid: true };
  }

  if (field === 'gradientRotation') {
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 360) {
      return { valid: false, error: 'gradientRotation must be between 0 and 360' };
    }
    return { valid: true };
  }

  return { valid: true };
}

// Validar una fila completa
function validateRow(data: Record<string, string>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allColumns = [...CSV_COLUMNS.required, ...CSV_COLUMNS.optional];

  for (const column of allColumns) {
    const value = data[column]?.trim() || '';
    const result = validateField(column, value, data);
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Transformar datos de fila a BulkQRItem
function transformToItem(data: Record<string, string>): BulkQRItem {
  const item: BulkQRItem = {
    type: data.type.toLowerCase() as QRType,
    content: data.content.trim(),
  };

  // Campos opcionales
  if (data.description) item.description = data.description.trim();
  if (data.campaignId) item.campaignId = data.campaignId.trim();
  if (data.color) item.color = data.color.trim();
  if (data.backgroundColor) item.backgroundColor = data.backgroundColor.trim();
  if (data.size) item.size = parseInt(data.size);
  if (data.format) item.format = data.format.toUpperCase() as QRFormat;
  if (data.dotStyle) item.dotStyle = data.dotStyle as DotStyle;
  if (data.cornerStyle) item.cornerStyle = data.cornerStyle as CornerStyle;
  if (data.cornerDotStyle) item.cornerDotStyle = data.cornerDotStyle as CornerDotStyle;
  if (data.cornerColor) item.cornerColor = data.cornerColor.trim();

  // Gradientes
  if (data.gradientEnabled) {
    item.gradientEnabled = ['true', '1'].includes(data.gradientEnabled.toLowerCase());
  }
  if (data.gradientType) item.gradientType = data.gradientType as GradientType;
  if (data.gradientStart) item.gradientStart = data.gradientStart.trim();
  if (data.gradientEnd) item.gradientEnd = data.gradientEnd.trim();
  if (data.gradientRotation) item.gradientRotation = parseInt(data.gradientRotation);

  return item;
}

// Resultado del parsing
export interface ParseCSVResult {
  success: boolean;
  rows: ParsedCSVRow[];
  validCount: number;
  invalidCount: number;
  error?: string;
}

// Parsear archivo CSV
export function parseCSV(file: File): Promise<ParseCSVResult> {
  return new Promise((resolve) => {
    // Validar tamaño
    if (file.size > BULK_LIMITS.maxFileSize) {
      resolve({
        success: false,
        rows: [],
        validCount: 0,
        invalidCount: 0,
        error: `File too large. Maximum size is ${BULK_LIMITS.maxFileSize / 1024}KB`,
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];

        // Validar que tenga datos
        if (data.length === 0) {
          resolve({
            success: false,
            rows: [],
            validCount: 0,
            invalidCount: 0,
            error: 'CSV file is empty',
          });
          return;
        }

        // Validar límite de filas
        if (data.length > BULK_LIMITS.maxItems) {
          resolve({
            success: false,
            rows: [],
            validCount: 0,
            invalidCount: 0,
            error: `Too many rows. Maximum is ${BULK_LIMITS.maxItems}`,
          });
          return;
        }

        // Verificar columnas requeridas
        const headers = results.meta.fields || [];
        const missingRequired = CSV_COLUMNS.required.filter(col => !headers.includes(col));
        if (missingRequired.length > 0) {
          resolve({
            success: false,
            rows: [],
            validCount: 0,
            invalidCount: 0,
            error: `Missing required columns: ${missingRequired.join(', ')}`,
          });
          return;
        }

        // Procesar cada fila
        const rows: ParsedCSVRow[] = [];
        let validCount = 0;
        let invalidCount = 0;

        for (let i = 0; i < data.length; i++) {
          const rowData = data[i];
          const validation = validateRow(rowData);

          const row: ParsedCSVRow = {
            index: i,
            data: rowData,
            isValid: validation.isValid,
            errors: validation.errors,
          };

          if (validation.isValid) {
            row.item = transformToItem(rowData);
            validCount++;
          } else {
            invalidCount++;
          }

          rows.push(row);
        }

        resolve({
          success: true,
          rows,
          validCount,
          invalidCount,
        });
      },
      error: (error) => {
        resolve({
          success: false,
          rows: [],
          validCount: 0,
          invalidCount: 0,
          error: `Failed to parse CSV: ${error.message}`,
        });
      },
    });
  });
}

// Obtener solo los items válidos
export function getValidItems(rows: ParsedCSVRow[]): BulkQRItem[] {
  return rows.filter(row => row.isValid && row.item).map(row => row.item!);
}
