'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { QRConfig, QR_TYPES } from '@/types/qr';
import { generateQRCode, downloadQRCodeWithDescription } from '@/lib/qr-generator';
import { generateQRContent, validateQRContent } from '@/lib/qr-content-generator';
import { FiCheckCircle, FiAlertCircle, FiDownload, FiFile } from 'react-icons/fi';
import { downloadSingleQRPDF } from '@/lib/pdf-generator';

interface QRPreviewProps {
  config: QRConfig;
}

export default function QRPreview({ config }: QRPreviewProps) {
  const { data: session } = useSession();
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Generar QR code cuando cambie la configuración (con debounce)
  useEffect(() => {
    isMountedRef.current = true;

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Validar contenido antes de generar
    const validation = validateQRContent(config);
    console.log('QRPreview validation:', validation, 'config.url:', config.url);
    if (!validation.isValid) {
      setQrDataURL('');
      return;
    }

    // Debounce de 300ms para evitar regenerar en cada tecla
    debounceTimerRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      setIsGenerating(true);
      setErrorMessage('');

      try {
        // Generar contenido según el tipo
        const content = generateQRContent(config);

        // Usamos un tamaño fijo de 256px para la vista previa
        const dataURL = await generateQRCode({
          content,
          color: config.color,
          backgroundColor: config.backgroundColor,
          size: 256,
          logo: config.logo,
          // Estilos avanzados
          dotStyle: config.dotStyle,
          cornerStyle: config.cornerStyle,
          cornerDotStyle: config.cornerDotStyle,
          cornerColor: config.cornerColor,
          gradientEnabled: config.gradientEnabled,
          gradientType: config.gradientType,
          gradientColorStart: config.gradientColorStart,
          gradientColorEnd: config.gradientColorEnd,
          gradientRotation: config.gradientRotation,
        });

        console.log('QR generated successfully, dataURL length:', dataURL?.length);
        if (isMountedRef.current) {
          setQrDataURL(dataURL);
        }
      } catch (error) {
        console.error('Error generating QR:', error);
        if (isMountedRef.current) {
          setErrorMessage('Error generating QR code');
          setQrDataURL('');
        }
      } finally {
        if (isMountedRef.current) {
          setIsGenerating(false);
        }
      }
    }, 300);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [config]);

  const handleDownload = async () => {
    // Validar contenido
    const validation = validateQRContent(config);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Please fill in the required fields');
      return;
    }

    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Generar contenido según el tipo
      const content = generateQRContent(config);

      // Si el usuario está logueado, guardar en la base de datos PRIMERO
      let qrContent = content; // Por defecto, contenido directo

      if (session?.user) {
        try {
          const response = await fetch('/api/qr/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: config.type,
              content, // La URL original del usuario
              description: config.description,
              color: config.color,
              backgroundColor: config.backgroundColor,
              size: config.size,
              format: config.format,
              logoUrl: config.logo,
              destinationUrl: content, // La URL real para redireccionar
              origin: window.location.origin, // Para construir el shortURL
              campaignId: config.campaignId, // Campaña opcional
              // Estilos avanzados
              dotStyle: config.dotStyle,
              cornerStyle: config.cornerStyle,
              cornerDotStyle: config.cornerDotStyle,
              cornerColor: config.cornerColor,
              gradientEnabled: config.gradientEnabled,
              gradientType: config.gradientType,
              gradientStart: config.gradientColorStart,
              gradientEnd: config.gradientColorEnd,
              gradientRotation: config.gradientRotation,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save QR code');
          }

          const data = await response.json();

          // Usar el shortURL devuelto por el servidor (ya está guardado en la BD)
          qrContent = data.qrCode.shortUrl;

          console.log('QR code saved with shortUrl:', qrContent);
        } catch (saveError) {
          console.error('Error saving QR code:', saveError);
          // No bloqueamos la descarga si falla el guardado
          setErrorMessage('QR code downloaded but could not be saved to your account');
        }
      }

      // Descargar el QR code (con contenido dinámico si está logueado)
      await downloadQRCodeWithDescription({
        content: qrContent, // Usar shortURL si está logueado, o contenido directo si no
        color: config.color,
        backgroundColor: config.backgroundColor,
        size: config.size,
        description: config.description,
        logo: config.logo,
        // Estilos avanzados
        dotStyle: config.dotStyle,
        cornerStyle: config.cornerStyle,
        cornerDotStyle: config.cornerDotStyle,
        cornerColor: config.cornerColor,
        gradientEnabled: config.gradientEnabled,
        gradientType: config.gradientType,
        gradientColorStart: config.gradientColorStart,
        gradientColorEnd: config.gradientColorEnd,
        gradientRotation: config.gradientRotation,
      }, config.format);

      // Mostrar mensaje de éxito
      if (session?.user) {
        setSuccessMessage(`Downloaded & saved!`);
      } else {
        setSuccessMessage(`Downloaded!`);
      }

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error downloading QR:', error);
      setErrorMessage('Error downloading QR code. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    // Validar contenido
    const validation = validateQRContent(config);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Please fill in the required fields');
      return;
    }

    if (!qrDataURL) {
      setErrorMessage('Please wait for QR code to generate');
      return;
    }

    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Generar QR con el tamaño completo para el PDF
      const content = generateQRContent(config);
      const fullSizeQR = await generateQRCode({
        content,
        color: config.color,
        backgroundColor: config.backgroundColor,
        size: config.size,
        logo: config.logo,
        dotStyle: config.dotStyle,
        cornerStyle: config.cornerStyle,
        cornerDotStyle: config.cornerDotStyle,
        cornerColor: config.cornerColor,
        gradientEnabled: config.gradientEnabled,
        gradientType: config.gradientType,
        gradientColorStart: config.gradientColorStart,
        gradientColorEnd: config.gradientColorEnd,
        gradientRotation: config.gradientRotation,
      });

      // Descargar PDF
      const filename = config.description
        ? `${config.description.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
        : 'qr-code.pdf';

      await downloadSingleQRPDF(fullSizeQR, config.description, filename);

      setSuccessMessage('PDF downloaded!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setErrorMessage('Error generating PDF. Please try again.');
    }
  };

  const getTypeLabel = () => {
    const typeOption = QR_TYPES.find((t) => t.value === config.type);
    return typeOption ? typeOption.label : 'URL';
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 lg:gap-6 p-4 lg:p-6">
      {/* QR Container - Compacto en mobile, grande en desktop */}
      <div className="relative w-full max-w-[220px] lg:max-w-[400px]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#40B49D]/20 to-[#f5576c]/20 rounded-2xl lg:rounded-3xl blur-xl"></div>

        <div className="relative bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-8 shadow-2xl">
          {/* Badge con tipo de QR */}
          <div className="absolute -top-2.5 lg:-top-3 left-1/2 -translate-x-1/2 px-3 lg:px-4 py-1 lg:py-1.5 bg-gradient-to-r from-[#f5576c] to-[#8538a6] rounded-full">
            <span className="text-white text-[10px] lg:text-xs font-semibold">{getTypeLabel()}</span>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mt-2 lg:mt-4">
            {isGenerating ? (
              <div className="w-44 h-44 lg:w-80 lg:h-80 flex items-center justify-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 lg:h-16 lg:w-16 border-4 border-[#f5576c]/30 border-t-[#f5576c]"></div>
                </div>
              </div>
            ) : qrDataURL ? (
              <div className="w-44 h-44 lg:w-80 lg:h-80 bg-white rounded-xl lg:rounded-2xl shadow-lg flex items-center justify-center">
                <img
                  src={qrDataURL}
                  alt="QR Code"
                  className="w-full h-full object-contain p-1 lg:p-2"
                />
              </div>
            ) : (
              <div className="w-44 h-44 lg:w-80 lg:h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl lg:rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-center px-4">
                  <div className="w-10 h-10 lg:w-16 lg:h-16 mx-auto mb-2 lg:mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-5 h-5 lg:w-8 lg:h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-xs lg:text-sm font-medium">Enter content</p>
                </div>
              </div>
            )}

            {/* Description - Solo en desktop o si hay descripción */}
            {config.description && qrDataURL && (
              <div className="text-center mt-3 lg:mt-6 animate-fadeIn">
                <h3 className="text-sm lg:text-xl font-bold text-gray-800 truncate max-w-[200px] lg:max-w-none">{config.description}</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages - Compactos */}
      {(successMessage || errorMessage) && (
        <div className="w-full max-w-[280px] lg:max-w-md">
          {successMessage && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-xl shadow-lg animate-slideInUp">
              <FiCheckCircle className="text-base" />
              <p className="text-xs font-medium">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-xl shadow-lg animate-shake">
              <FiAlertCircle className="text-base" />
              <p className="text-xs font-medium flex-1">{errorMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Download Buttons - Compactos en mobile */}
      <div className="w-full max-w-[280px] lg:max-w-md flex gap-2 lg:gap-3">
        {/* Main Download Button (PNG/SVG) */}
        <button
          onClick={handleDownload}
          disabled={!qrDataURL}
          className="flex-1 group relative px-4 lg:px-6 py-3 lg:py-4 bg-gradient-to-r from-[#f5576c] to-[#8538a6] text-white font-bold text-sm lg:text-base rounded-xl shadow-xl hover:shadow-2xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <span className="relative flex items-center justify-center gap-2">
            <FiDownload className="text-base lg:text-lg" />
            {config.format.toUpperCase()}
          </span>
        </button>

        {/* PDF Download Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={!qrDataURL}
          className="px-4 lg:px-6 py-3 lg:py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold text-sm lg:text-base rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="flex items-center justify-center gap-1.5 lg:gap-2">
            <FiFile className="text-base lg:text-lg" />
            PDF
          </span>
        </button>
      </div>
    </div>
  );
}
