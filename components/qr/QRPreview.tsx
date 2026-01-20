'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { QRConfig, QR_TYPES } from '@/types/qr';
import { generateQRCode, downloadQRCodeWithDescription } from '@/lib/qr-generator';
import { generateQRContent, validateQRContent } from '@/lib/qr-content-generator';
import { renderWithFramePNG } from '@/lib/frame-renderer';
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
        let dataURL = await generateQRCode({
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

        // Si hay frame, aplicarlo
        if (config.frameId) {
          dataURL = await renderWithFramePNG({
            frameId: config.frameId,
            qrDataUrl: dataURL,
            qrSize: 256,
            frameColor: config.frameColor,
            frameText: config.frameText,
            backgroundColor: config.backgroundColor,
          });
        }

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
              // Frame
              frameId: config.frameId,
              frameColor: config.frameColor,
              frameText: config.frameText,
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
      // Si hay frame, usamos un flujo especial
      if (config.frameId) {
        // Generar QR base al tamaño solicitado
        let qrDataUrl = await generateQRCode({
          content: qrContent,
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

        // Aplicar frame
        qrDataUrl = await renderWithFramePNG({
          frameId: config.frameId,
          qrDataUrl: qrDataUrl,
          qrSize: config.size,
          frameColor: config.frameColor,
          frameText: config.frameText,
          backgroundColor: config.backgroundColor,
        });

        // Descargar directamente
        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.png`;
        link.href = qrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Sin frame, usar la función original
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
      }

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
      let fullSizeQR = await generateQRCode({
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

      // Si hay frame, aplicarlo
      if (config.frameId) {
        fullSizeQR = await renderWithFramePNG({
          frameId: config.frameId,
          qrDataUrl: fullSizeQR,
          qrSize: config.size,
          frameColor: config.frameColor,
          frameText: config.frameText,
          backgroundColor: config.backgroundColor,
        });
      }

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
    <div className="w-full flex flex-col items-center gap-4 lg:gap-6 p-4 lg:p-8">
      {/* QR Preview Label - Mobile only */}
      <div className="lg:hidden w-full">
        <div className="flex items-center justify-center gap-2 text-white/70 text-xs font-medium">
          <div className="h-px flex-1 bg-white/20"></div>
          <span>PREVIEW</span>
          <div className="h-px flex-1 bg-white/20"></div>
        </div>
      </div>

      {/* QR Container - Clean modern design */}
      <div className="relative w-full max-w-[200px] lg:max-w-[320px]">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl lg:rounded-3xl blur-2xl scale-110"></div>

        <div className="relative bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            {isGenerating ? (
              <div className="w-[168px] h-[168px] lg:w-[272px] lg:h-[272px] flex items-center justify-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 lg:h-12 lg:w-12 border-3 border-gray-200 border-t-[#8538a6]"></div>
                </div>
              </div>
            ) : qrDataURL ? (
              <div className="w-[168px] h-[168px] lg:w-[272px] lg:h-[272px] flex items-center justify-center">
                <img
                  src={qrDataURL}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-[168px] h-[168px] lg:w-[272px] lg:h-[272px] flex items-center justify-center bg-gray-50 rounded-xl lg:rounded-2xl border-2 border-dashed border-gray-200">
                <div className="text-center px-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-6 h-6 lg:w-7 lg:h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-xs lg:text-sm font-medium">Your QR code</p>
                  <p className="text-gray-300 text-[10px] lg:text-xs mt-1">Enter content to preview</p>
                </div>
              </div>
            )}
          </div>

          {/* Type Badge - Below QR */}
          <div className="flex justify-center mt-3 lg:mt-4">
            <div className="px-3 py-1 bg-gradient-to-r from-[#f5576c]/10 to-[#8538a6]/10 rounded-full border border-[#8538a6]/20">
              <span className="text-[#8538a6] text-[10px] lg:text-xs font-semibold">{getTypeLabel()}</span>
            </div>
          </div>

          {/* Description */}
          {config.description && qrDataURL && (
            <div className="text-center mt-2 lg:mt-3">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-700 truncate">{config.description}</h3>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {(successMessage || errorMessage) && (
        <div className="w-full max-w-[280px] lg:max-w-sm">
          {successMessage && (
            <div className="flex items-center gap-2 bg-[#40B49D] text-white px-4 py-2.5 rounded-xl shadow-lg animate-slideInUp">
              <FiCheckCircle className="text-base flex-shrink-0" />
              <p className="text-xs font-medium">{successMessage}</p>
            </div>
          )}
          {errorMessage && (
            <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl shadow-lg animate-shake">
              <FiAlertCircle className="text-base flex-shrink-0" />
              <p className="text-xs font-medium flex-1">{errorMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Download Buttons - Modern flat design */}
      <div className="w-full max-w-[280px] lg:max-w-sm flex gap-2">
        {/* Main Download Button (PNG/SVG) */}
        <button
          onClick={handleDownload}
          disabled={!qrDataURL}
          className="flex-1 group relative px-4 py-3 lg:py-3.5 bg-white text-gray-900 font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl disabled:bg-white/50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex items-center justify-center gap-2">
            <FiDownload className="text-base" />
            Download {config.format.toUpperCase()}
          </span>
        </button>

        {/* PDF Download Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={!qrDataURL}
          className="px-4 py-3 lg:py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex items-center justify-center gap-1.5">
            <FiFile className="text-base" />
            PDF
          </span>
        </button>
      </div>
    </div>
  );
}
