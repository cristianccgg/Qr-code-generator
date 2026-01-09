// Utilidad para generar el contenido del QR según su tipo
import { QRConfig } from "@/types/qr";
import { normalizeURL } from "./validators";

/**
 * Genera el contenido del QR code basado en su tipo
 */
export function generateQRContent(config: QRConfig): string {
  switch (config.type) {
    case "url":
      // Normalizar y asegurarnos que la URL esté correctamente encodificada
      return encodeURI(normalizeURL(config.url));

    case "text":
      return config.text || "";

    case "email":
      // Formato: mailto:email@example.com
      return `mailto:${config.email || ""}`;

    case "phone":
      // Formato: tel:+1234567890
      return `tel:${config.phone || ""}`;

    case "sms":
      // Formato: sms:+1234567890
      return `sms:${config.sms || ""}`;

    case "wifi":
      // Formato: WIFI:T:WPA;S:SSID;P:password;;
      const encryption = config.wifiEncryption || "WPA";
      const ssid = config.wifiSSID || "";
      const password = config.wifiPassword || "";
      return `WIFI:T:${encryption};S:${ssid};P:${password};;`;

    case "vcard":
      // Formato vCard 3.0
      const name = config.vcardName || "";
      const phone = config.vcardPhone || "";
      const email = config.vcardEmail || "";
      const org = config.vcardOrganization || "";

      return `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL:${phone}
EMAIL:${email}
ORG:${org}
END:VCARD`;

    default:
      // Asegurar que no haya saltos de línea ni espacios indeseados
      return (config.url || "").trim();
  }
}

/**
 * Valida que el contenido del QR sea válido según su tipo
 */
export function validateQRContent(config: QRConfig): {
  isValid: boolean;
  error?: string;
} {
  switch (config.type) {
    case "url":
      if (!config.url || config.url.trim() === "") {
        return { isValid: false, error: "Please enter a URL" };
      }
      break;

    case "text":
      if (!config.text || config.text.trim() === "") {
        return { isValid: false, error: "Please enter some text" };
      }
      break;

    case "email":
      if (!config.email || config.email.trim() === "") {
        return { isValid: false, error: "Please enter an email address" };
      }
      // Validación básica de email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
        return { isValid: false, error: "Please enter a valid email address" };
      }
      break;

    case "phone":
      if (!config.phone || config.phone.trim() === "") {
        return { isValid: false, error: "Please enter a phone number" };
      }
      break;

    case "sms":
      if (!config.sms || config.sms.trim() === "") {
        return { isValid: false, error: "Please enter a phone number" };
      }
      break;

    case "wifi":
      if (!config.wifiSSID || config.wifiSSID.trim() === "") {
        return {
          isValid: false,
          error: "Please enter the WiFi network name (SSID)",
        };
      }
      break;

    case "vcard":
      if (!config.vcardName || config.vcardName.trim() === "") {
        return { isValid: false, error: "Please enter a contact name" };
      }
      break;
  }

  return { isValid: true };
}
