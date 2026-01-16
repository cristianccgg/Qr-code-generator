'use client';

import { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import QRForm from '@/components/qr/QRForm';
import QRPreview from '@/components/qr/QRPreview';
import { QRConfig } from '@/types/qr';

export default function Home() {
  const [config, setConfig] = useState<QRConfig>({
    type: 'url',
    url: '',
    description: '',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    size: 512,
    format: 'png',
  });

  // Ya no necesitamos previewConfig separado - el preview se actualiza automáticamente

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5576c] via-[#8538a6] to-[#7386bf] relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#40B49D]/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f2cb57]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <main className="container mx-auto px-4 py-4 lg:py-8">
          {/* Hero Section - Compact on mobile */}
          <div className="text-center mb-4 lg:mb-12 animate-fadeIn">
            <h1 className="text-white text-2xl md:text-5xl lg:text-6xl font-black mb-1 lg:mb-4 drop-shadow-2xl">
              Create Your QR Code
            </h1>
            <p className="text-white/90 text-sm lg:text-xl font-medium max-w-2xl mx-auto hidden lg:block">
              Generate beautiful, customizable QR codes in seconds. Free, fast, and powerful.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 max-w-7xl mx-auto pb-8 lg:pb-16">
            {/* Preview Section - First on mobile, second on desktop */}
            <div className="w-full order-first lg:order-last">
              <QRPreview config={config} />
            </div>

            {/* Form Section - Second on mobile, first on desktop */}
            <div className="w-full order-last lg:order-first">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <QRForm
                  config={config}
                  onConfigChange={setConfig}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Footer - Hidden on mobile */}
        <footer className="hidden lg:block text-center py-8 text-white/60 text-sm">
          <p>Made with ❤️ for everyone who needs a simple QR code</p>
        </footer>
      </div>
    </div>
  );
}
