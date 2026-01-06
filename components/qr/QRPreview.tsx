'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { QRConfig, QR_SIZES, QR_TYPES } from '@/types/qr';
import { generateQRCode, downloadQRCodeWithDescription } from '@/lib/qr-generator';
import { generateQRContent, validateQRContent } from '@/lib/qr-content-generator';
import { FiCheckCircle, FiAlertCircle, FiDownload } from 'react-icons/fi';

interface QRPreviewProps {
  config: QRConfig;
}

export default function QRPreview({ config }: QRPreviewProps) {
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Generar QR code cuando cambie la configuración
  useEffect(() => {
    const generateQR = async () => {
      // Validar contenido antes de generar
      const validation = validateQRContent(config);
      if (!validation.isValid) {
        setQrDataURL('');
        return;
      }

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
        });
        setQrDataURL(dataURL);
      } catch (error) {
        console.error('Error generating QR:', error);
        setErrorMessage('Error generating QR code');
        setQrDataURL('');
      } finally {
        setIsGenerating(false);
      }
    };

    generateQR();
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

      await downloadQRCodeWithDescription({
        content,
        color: config.color,
        backgroundColor: config.backgroundColor,
        size: config.size,
        description: config.description,
        logo: config.logo,
      }, config.format);

      // Mostrar mensaje de éxito
      setSuccessMessage(`QR code downloaded successfully as ${config.format.toUpperCase()}!`);

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error downloading QR:', error);
      setErrorMessage('Error downloading QR code. Please try again.');
    }
  };

  const getSizeLabel = () => {
    const sizeOption = QR_SIZES.find((s) => s.value === config.size);
    return sizeOption ? sizeOption.label : 'Medium';
  };

  const getTypeLabel = () => {
    const typeOption = QR_TYPES.find((t) => t.value === config.type);
    return typeOption ? typeOption.label : 'URL';
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-white text-3xl font-bold">Preview</h2>
        <p className="text-white/70 text-sm">Your QR code will look like this</p>
      </div>

      {/* QR Container - Modernizado */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-br from-[#40B49D]/20 to-[#f5576c]/20 rounded-3xl blur-xl"></div>

        <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
          {/* Badge con tipo de QR */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[#f5576c] to-[#8538a6] rounded-full">
            <span className="text-white text-xs font-semibold">{getTypeLabel()}</span>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-6 mt-4">
            {isGenerating ? (
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#f5576c]/30 border-t-[#f5576c]"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-[#f5576c]/20"></div>
                </div>
              </div>
            ) : qrDataURL ? (
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#40B49D] to-[#f5576c] rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity"></div>
                <div className="relative w-64 h-64 bg-white rounded-2xl p-2 shadow-lg">
                  <Image
                    src={qrDataURL}
                    alt="QR Code"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-center px-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm font-medium">Fill in the form to generate</p>
                  <p className="text-gray-400 text-xs mt-1">your QR code</p>
                </div>
              </div>
            )}

            {/* Description */}
            {config.description && qrDataURL && (
              <div className="text-center animate-fadeIn">
                <h3 className="text-xl font-bold text-gray-800">{config.description}</h3>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="w-full max-w-md grid grid-cols-2 gap-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <p className="text-white/60 text-xs font-medium mb-1">Size</p>
          <p className="text-white text-sm font-bold">{getSizeLabel()}</p>
          <p className="text-white/40 text-xs">{config.size}×{config.size}px</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <p className="text-white/60 text-xs font-medium mb-1">Format</p>
          <p className="text-white text-sm font-bold">{config.format.toUpperCase()}</p>
          <p className="text-white/40 text-xs">
            {config.format === 'png' ? 'Raster image' : 'Vector image'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="w-full max-w-md space-y-3">
        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-4 rounded-xl shadow-lg animate-slideInUp">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="text-xl" />
            </div>
            <p className="text-sm font-medium flex-1">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-4 rounded-xl shadow-lg animate-shake">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <FiAlertCircle className="text-xl" />
            </div>
            <p className="text-sm font-medium flex-1">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={!qrDataURL}
        className="w-full max-w-md group relative px-8 py-4 bg-gradient-to-r from-[#f5576c] to-[#8538a6] text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
      >
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        <span className="relative flex items-center justify-center gap-2">
          <FiDownload className="text-xl" />
          Download QR Code
        </span>
      </button>
    </div>
  );
}
