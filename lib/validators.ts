// Utilidades de validación

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida si una URL es válida
 */
export function validateURL(url: string): ValidationResult {
  // Verificar que no esté vacía
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      error: 'Please enter a URL',
    };
  }

  // Agregar https:// si no tiene protocolo
  let urlToValidate = url.trim();
  if (!/^https?:\/\//i.test(urlToValidate)) {
    urlToValidate = 'https://' + urlToValidate;
  }

  // Validar formato de URL
  try {
    const urlObject = new URL(urlToValidate);

    // Verificar que tenga un dominio válido
    if (!urlObject.hostname || urlObject.hostname.length < 3) {
      return {
        isValid: false,
        error: 'Please enter a valid domain',
      };
    }

    // Verificar que tenga al menos un punto (ej: google.com)
    if (!urlObject.hostname.includes('.')) {
      return {
        isValid: false,
        error: 'Please enter a valid domain (e.g., example.com)',
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Normaliza una URL agregando https:// si no tiene protocolo
 */
export function normalizeURL(url: string): string {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return 'https://' + trimmed;
  }
  return trimmed;
}
