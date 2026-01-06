"use client";

import { QR_SIZES, QR_FORMATS, QR_TYPES, QRConfig, QRType } from "@/types/qr";
import { FiLink, FiEdit3, FiType, FiMail, FiPhone, FiMessageSquare, FiWifi, FiUser, FiLock, FiUpload, FiX, FiImage } from "react-icons/fi";
import Image from "next/image";
import ColorPicker from "./ColorPicker";

interface QRFormProps {
  config: QRConfig;
  onConfigChange: (config: QRConfig) => void;
}

export default function QRForm({
  config,
  onConfigChange,
}: QRFormProps) {

  // Función helper para cambiar el tipo y limpiar campos
  const handleTypeChange = (newType: QRType) => {
    onConfigChange({
      ...config,
      type: newType,
      // Limpiar campos opcionales al cambiar tipo
      url: '',
      text: '',
      email: '',
      phone: '',
      sms: '',
      wifiSSID: '',
      wifiPassword: '',
      vcardName: '',
      vcardPhone: '',
      vcardEmail: '',
      vcardOrganization: '',
    });
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* QR Type Selector - NUEVO */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <label className="block text-white text-sm font-semibold mb-3">
          QR Code Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {QR_TYPES.map((type) => {
            const Icon = type.value === 'url' ? FiLink :
                        type.value === 'text' ? FiType :
                        type.value === 'email' ? FiMail :
                        type.value === 'phone' ? FiPhone :
                        type.value === 'sms' ? FiMessageSquare :
                        type.value === 'wifi' ? FiWifi :
                        FiUser;

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  config.type === type.value
                    ? 'bg-white text-[#f5576c] border-white shadow-lg scale-105'
                    : 'bg-white/5 text-white border-white/30 hover:bg-white/10 hover:border-white/50'
                }`}
              >
                <Icon className="text-2xl" />
                <span className="text-xs font-medium text-center">{type.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campos dinámicos según el tipo */}
      <div className="space-y-4">
        {/* URL Type */}
        {config.type === 'url' && (
          <div className="animate-fadeIn">
            <label htmlFor="url" className="block text-white text-sm font-semibold mb-2">
              Website URL
            </label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
                <FiLink className="text-white text-xl" />
              </div>
              <input
                type="text"
                id="url"
                value={config.url}
                onChange={(e) => onConfigChange({ ...config, url: e.target.value })}
                placeholder="https://example.com"
                className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Text Type */}
        {config.type === 'text' && (
          <div className="animate-fadeIn">
            <label htmlFor="text" className="block text-white text-sm font-semibold mb-2">
              Text Content
            </label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
                <FiType className="text-white text-xl" />
              </div>
              <textarea
                id="text"
                value={config.text || ''}
                onChange={(e) => onConfigChange({ ...config, text: e.target.value })}
                placeholder="Enter any text..."
                rows={3}
                className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* Email Type */}
        {config.type === 'email' && (
          <div className="animate-fadeIn">
            <label htmlFor="email" className="block text-white text-sm font-semibold mb-2">
              Email Address
            </label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
                <FiMail className="text-white text-xl" />
              </div>
              <input
                type="email"
                id="email"
                value={config.email || ''}
                onChange={(e) => onConfigChange({ ...config, email: e.target.value })}
                placeholder="email@example.com"
                className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Phone Type */}
        {config.type === 'phone' && (
          <div className="animate-fadeIn">
            <label htmlFor="phone" className="block text-white text-sm font-semibold mb-2">
              Phone Number
            </label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
                <FiPhone className="text-white text-xl" />
              </div>
              <input
                type="tel"
                id="phone"
                value={config.phone || ''}
                onChange={(e) => onConfigChange({ ...config, phone: e.target.value })}
                placeholder="+1234567890"
                className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* SMS Type */}
        {config.type === 'sms' && (
          <div className="animate-fadeIn">
            <label htmlFor="sms" className="block text-white text-sm font-semibold mb-2">
              Phone Number (SMS)
            </label>
            <div className="flex gap-3">
              <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
                <FiMessageSquare className="text-white text-xl" />
              </div>
              <input
                type="tel"
                id="sms"
                value={config.sms || ''}
                onChange={(e) => onConfigChange({ ...config, sms: e.target.value })}
                placeholder="+1234567890"
                className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* WiFi Type */}
        {config.type === 'wifi' && (
          <div className="animate-fadeIn space-y-4">
            <div>
              <label htmlFor="wifiSSID" className="block text-white text-sm font-semibold mb-2">
                Network Name (SSID)
              </label>
              <div className="flex gap-3">
                <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
                  <FiWifi className="text-white text-xl" />
                </div>
                <input
                  type="text"
                  id="wifiSSID"
                  value={config.wifiSSID || ''}
                  onChange={(e) => onConfigChange({ ...config, wifiSSID: e.target.value })}
                  placeholder="My WiFi Network"
                  className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="wifiPassword" className="block text-white text-sm font-semibold mb-2">
                Password
              </label>
              <div className="flex gap-3">
                <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
                  <FiLock className="text-white text-xl" />
                </div>
                <input
                  type="text"
                  id="wifiPassword"
                  value={config.wifiPassword || ''}
                  onChange={(e) => onConfigChange({ ...config, wifiPassword: e.target.value })}
                  placeholder="password123"
                  className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="wifiEncryption" className="block text-white text-sm font-semibold mb-2">
                Security Type
              </label>
              <select
                id="wifiEncryption"
                value={config.wifiEncryption || 'WPA'}
                onChange={(e) => onConfigChange({ ...config, wifiEncryption: e.target.value as 'WPA' | 'WEP' | 'nopass' })}
                className="w-full px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
          </div>
        )}

        {/* vCard Type */}
        {config.type === 'vcard' && (
          <div className="animate-fadeIn space-y-4">
            <div>
              <label htmlFor="vcardName" className="block text-white text-sm font-semibold mb-2">
                Full Name *
              </label>
              <div className="flex gap-3">
                <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
                  <FiUser className="text-white text-xl" />
                </div>
                <input
                  type="text"
                  id="vcardName"
                  value={config.vcardName || ''}
                  onChange={(e) => onConfigChange({ ...config, vcardName: e.target.value })}
                  placeholder="John Doe"
                  className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="vcardPhone" className="block text-white text-sm font-semibold mb-2">
                Phone Number
              </label>
              <div className="flex gap-3">
                <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
                  <FiPhone className="text-white text-xl" />
                </div>
                <input
                  type="tel"
                  id="vcardPhone"
                  value={config.vcardPhone || ''}
                  onChange={(e) => onConfigChange({ ...config, vcardPhone: e.target.value })}
                  placeholder="+1234567890"
                  className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="vcardEmail" className="block text-white text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="flex gap-3">
                <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
                  <FiMail className="text-white text-xl" />
                </div>
                <input
                  type="email"
                  id="vcardEmail"
                  value={config.vcardEmail || ''}
                  onChange={(e) => onConfigChange({ ...config, vcardEmail: e.target.value })}
                  placeholder="john@example.com"
                  className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="vcardOrganization" className="block text-white text-sm font-semibold mb-2">
                Organization
              </label>
              <input
                type="text"
                id="vcardOrganization"
                value={config.vcardOrganization || ''}
                onChange={(e) => onConfigChange({ ...config, vcardOrganization: e.target.value })}
                placeholder="Company Name"
                className="w-full px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Description (común para todos) */}
        <div>
          <label htmlFor="description" className="block text-white text-sm font-semibold mb-2">
            Description (optional)
          </label>
          <div className="flex gap-3">
            <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-3 min-w-[50px]">
              <FiEdit3 className="text-white text-xl" />
            </div>
            <input
              type="text"
              id="description"
              value={config.description}
              onChange={(e) => onConfigChange({ ...config, description: e.target.value })}
              placeholder="Label for your QR code"
              className="flex-1 px-4 py-3 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Customization Options */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-4">
        <h3 className="text-white font-semibold text-sm mb-3">Customization</h3>

        {/* Color Picker Avanzado */}
        <ColorPicker
          color={config.color}
          onChange={(color) => onConfigChange({ ...config, color })}
          label="QR Code Color"
        />

        {/* Background Color Picker */}
        <ColorPicker
          color={config.backgroundColor || '#FFFFFF'}
          onChange={(color) => onConfigChange({ ...config, backgroundColor: color })}
          label="Background Color"
        />

        {/* Logo Upload */}
        <div>
          <label className="block text-white text-xs font-medium mb-2">
            Logo in Center (Optional)
          </label>

          {!config.logo ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl hover:border-white/60 hover:bg-white/5 transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiUpload className="w-10 h-10 text-white/60 group-hover:text-white/80 mb-2 transition-colors" />
                <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-white/40">PNG, JPG or SVG (max 2MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validar tamaño (2MB)
                    if (file.size > 2 * 1024 * 1024) {
                      alert('File too large. Maximum size is 2MB.');
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      onConfigChange({ ...config, logo: dataUrl });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          ) : (
            <div className="relative w-full h-32 border-2 border-white/30 rounded-xl overflow-hidden bg-white/10 backdrop-blur">
              <Image
                src={config.logo}
                alt="Logo"
                fill
                className="object-contain p-4"
                unoptimized
              />
              <button
                type="button"
                onClick={() => onConfigChange({ ...config, logo: undefined })}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                title="Remove logo"
              >
                <FiX className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-white text-xs">
                <FiImage className="inline mr-1" />
                Logo added
              </div>
            </div>
          )}
        </div>

        {/* Size & Format en una sola línea */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="size" className="block text-white text-xs font-medium mb-2">
              Size
            </label>
            <select
              id="size"
              value={config.size}
              onChange={(e) => onConfigChange({ ...config, size: Number(e.target.value) })}
              className="w-full px-3 py-3 bg-white/90 backdrop-blur rounded-xl border-none outline-none text-sm"
            >
              {QR_SIZES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label.replace(' (', ' - ').replace('px)', '')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="format" className="block text-white text-xs font-medium mb-2">
              Format
            </label>
            <select
              id="format"
              value={config.format}
              onChange={(e) => onConfigChange({ ...config, format: e.target.value as 'png' | 'svg' })}
              className="w-full px-3 py-3 bg-white/90 backdrop-blur rounded-xl border-none outline-none text-sm"
            >
              {QR_FORMATS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info text */}
      <div className="text-center">
        <p className="text-white/60 text-sm">
          Your QR code updates automatically as you type ✨
        </p>
      </div>
    </div>
  );
}
