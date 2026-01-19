"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { QR_SIZES, QR_FORMATS, QR_TYPES, QRConfig, QRType, DOT_STYLES, CORNER_STYLES, DotStyle, CornerStyle } from "@/types/qr";
import { QRTemplate } from "@/types/templates";
import { FiLink, FiEdit3, FiType, FiMail, FiPhone, FiMessageSquare, FiWifi, FiUser, FiLock, FiUpload, FiX, FiImage, FiFolder, FiDroplet, FiGrid, FiSquare, FiCircle, FiFileText, FiSliders, FiLayout, FiStar } from "react-icons/fi";
import TemplatesTab from "./templates/TemplatesTab";
import Image from "next/image";
import ColorPicker from "./ColorPicker";
import { useSubscription } from "@/hooks/useSubscription";
import { useUpgradeModal } from "@/components/billing/UpgradeModal";

interface Campaign {
  id: string;
  name: string;
}

interface QRFormProps {
  config: QRConfig;
  onConfigChange: (config: QRConfig) => void;
}

type MainTab = 'content' | 'design';
type DesignTab = 'colors' | 'style' | 'templates';

export default function QRForm({
  config,
  onConfigChange,
}: QRFormProps) {
  const { data: session } = useSession();
  const { canUseLogo } = useSubscription();
  const { showUpgradeModal } = useUpgradeModal();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>('content');
  const [designTab, setDesignTab] = useState<DesignTab>('colors');

  // Cargar campañas del usuario
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!session) return;
      setIsLoadingCampaigns(true);
      try {
        const response = await fetch('/api/campaigns');
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, [session]);

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

  // Iconos para cada tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return FiLink;
      case 'text': return FiType;
      case 'email': return FiMail;
      case 'phone': return FiPhone;
      case 'sms': return FiMessageSquare;
      case 'wifi': return FiWifi;
      default: return FiUser;
    }
  };

  return (
    <div className="w-full">
      {/* Main Tab Headers - Content / Design */}
      <div className="flex border-b border-white/20">
        <button
          type="button"
          onClick={() => setMainTab('content')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${
            mainTab === 'content'
              ? 'bg-white/20 text-white border-b-2 border-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <FiFileText className="text-base" />
          Content
        </button>
        <button
          type="button"
          onClick={() => setMainTab('design')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${
            mainTab === 'design'
              ? 'bg-white/20 text-white border-b-2 border-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <FiSliders className="text-base" />
          Design
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Content Tab - Renderizado inline para evitar re-mount */}
        <div className={mainTab === 'content' ? 'block' : 'hidden'}>
          <div className="space-y-4">
            {/* QR Type Selector - Compacto */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <label className="block text-white text-xs font-semibold mb-2">
                QR Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QR_TYPES.map((type) => {
                  const Icon = getTypeIcon(type.value);
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleTypeChange(type.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs ${
                        config.type === type.value
                          ? 'bg-white text-[#f5576c] border-white shadow-md font-semibold'
                          : 'bg-white/5 text-white/80 border-white/20 hover:bg-white/10 hover:border-white/40'
                      }`}
                    >
                      <Icon className="text-sm" />
                      <span>{type.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campos dinámicos según el tipo */}
            <div className="space-y-3">
              {/* URL Type */}
              {config.type === 'url' && (
                <div>
                  <label htmlFor="url" className="block text-white text-sm font-semibold mb-2">
                    Website URL
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-2.5 min-w-[44px]">
                      <FiLink className="text-white text-lg" />
                    </div>
                    <input
                      type="text"
                      id="url"
                      value={config.url}
                      onChange={(e) => onConfigChange({ ...config, url: e.target.value })}
                      placeholder="https://example.com"
                      className="flex-1 px-3 py-2.5 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Text Type */}
              {config.type === 'text' && (
                <div>
                  <label htmlFor="text" className="block text-white text-sm font-semibold mb-2">
                    Text Content
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-2.5 min-w-[44px]">
                      <FiType className="text-white text-lg" />
                    </div>
                    <textarea
                      id="text"
                      value={config.text || ''}
                      onChange={(e) => onConfigChange({ ...config, text: e.target.value })}
                      placeholder="Enter any text..."
                      rows={2}
                      className="flex-1 px-3 py-2.5 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all resize-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Email Type */}
              {config.type === 'email' && (
                <div>
                  <label htmlFor="email" className="block text-white text-sm font-semibold mb-2">
                    Email Address
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-2.5 min-w-[44px]">
                      <FiMail className="text-white text-lg" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={config.email || ''}
                      onChange={(e) => onConfigChange({ ...config, email: e.target.value })}
                      placeholder="email@example.com"
                      className="flex-1 px-3 py-2.5 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Phone Type */}
              {config.type === 'phone' && (
                <div>
                  <label htmlFor="phone" className="block text-white text-sm font-semibold mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-2.5 min-w-[44px]">
                      <FiPhone className="text-white text-lg" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={config.phone || ''}
                      onChange={(e) => onConfigChange({ ...config, phone: e.target.value })}
                      placeholder="+1234567890"
                      className="flex-1 px-3 py-2.5 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {/* SMS Type */}
              {config.type === 'sms' && (
                <div>
                  <label htmlFor="sms" className="block text-white text-sm font-semibold mb-2">
                    Phone Number (SMS)
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-2.5 min-w-[44px]">
                      <FiMessageSquare className="text-white text-lg" />
                    </div>
                    <input
                      type="tel"
                      id="sms"
                      value={config.sms || ''}
                      onChange={(e) => onConfigChange({ ...config, sms: e.target.value })}
                      placeholder="+1234567890"
                      className="flex-1 px-3 py-2.5 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {/* WiFi Type */}
              {config.type === 'wifi' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="wifiSSID" className="block text-white text-sm font-semibold mb-2">
                      Network Name (SSID)
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-2.5 min-w-[44px]">
                        <FiWifi className="text-white text-lg" />
                      </div>
                      <input
                        type="text"
                        id="wifiSSID"
                        value={config.wifiSSID || ''}
                        onChange={(e) => onConfigChange({ ...config, wifiSSID: e.target.value })}
                        placeholder="My WiFi Network"
                        className="flex-1 px-3 py-2.5 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="wifiPassword" className="block text-white text-xs font-medium mb-1">
                        Password
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-lg p-2 min-w-[36px]">
                          <FiLock className="text-white text-sm" />
                        </div>
                        <input
                          type="text"
                          id="wifiPassword"
                          value={config.wifiPassword || ''}
                          onChange={(e) => onConfigChange({ ...config, wifiPassword: e.target.value })}
                          placeholder="password"
                          className="flex-1 px-3 py-2 bg-white/90 backdrop-blur rounded-lg border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="wifiEncryption" className="block text-white text-xs font-medium mb-1">
                        Security
                      </label>
                      <select
                        id="wifiEncryption"
                        value={config.wifiEncryption || 'WPA'}
                        onChange={(e) => onConfigChange({ ...config, wifiEncryption: e.target.value as 'WPA' | 'WEP' | 'nopass' })}
                        className="w-full px-3 py-2 bg-white/90 backdrop-blur rounded-lg border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                      >
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* vCard Type */}
              {config.type === 'vcard' && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="vcardName" className="block text-white text-sm font-semibold mb-2">
                      Full Name *
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-xl p-2.5 min-w-[44px]">
                        <FiUser className="text-white text-lg" />
                      </div>
                      <input
                        type="text"
                        id="vcardName"
                        value={config.vcardName || ''}
                        onChange={(e) => onConfigChange({ ...config, vcardName: e.target.value })}
                        placeholder="John Doe"
                        className="flex-1 px-3 py-2.5 bg-white/90 backdrop-blur rounded-xl border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="vcardPhone" className="block text-white text-xs font-medium mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="vcardPhone"
                        value={config.vcardPhone || ''}
                        onChange={(e) => onConfigChange({ ...config, vcardPhone: e.target.value })}
                        placeholder="+1234567890"
                        className="w-full px-3 py-2 bg-white/90 backdrop-blur rounded-lg border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="vcardEmail" className="block text-white text-xs font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="vcardEmail"
                        value={config.vcardEmail || ''}
                        onChange={(e) => onConfigChange({ ...config, vcardEmail: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 bg-white/90 backdrop-blur rounded-lg border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="vcardOrganization" className="block text-white text-xs font-medium mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      id="vcardOrganization"
                      value={config.vcardOrganization || ''}
                      onChange={(e) => onConfigChange({ ...config, vcardOrganization: e.target.value })}
                      placeholder="Company Name"
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur rounded-lg border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Description (común para todos) */}
              <div>
                <label htmlFor="description" className="block text-white text-xs font-medium mb-1">
                  Description (optional)
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-lg p-2 min-w-[36px]">
                    <FiEdit3 className="text-white text-sm" />
                  </div>
                  <input
                    type="text"
                    id="description"
                    value={config.description}
                    onChange={(e) => onConfigChange({ ...config, description: e.target.value })}
                    placeholder="Label for your QR code"
                    className="flex-1 px-3 py-2 bg-white/90 backdrop-blur rounded-lg border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Campaign Selector (solo para usuarios logueados) */}
              {session && (
                <div>
                  <label htmlFor="campaign" className="block text-white text-xs font-medium mb-1">
                    Campaign (optional)
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center bg-white/20 backdrop-blur rounded-lg p-2 min-w-[36px]">
                      <FiFolder className="text-white text-sm" />
                    </div>
                    <select
                      id="campaign"
                      value={config.campaignId || ''}
                      onChange={(e) => onConfigChange({ ...config, campaignId: e.target.value || undefined })}
                      disabled={isLoadingCampaigns}
                      className="flex-1 px-3 py-2 bg-white/90 backdrop-blur rounded-lg border-2 border-transparent focus:border-white focus:bg-white outline-none transition-all text-sm"
                    >
                      <option value="">No campaign</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Design Tab with sub-tabs - Renderizado inline */}
        <div className={mainTab === 'design' ? 'block' : 'hidden'}>
          <div className="space-y-4">
            {/* Design Sub-tabs */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDesignTab('colors')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  designTab === 'colors'
                    ? 'bg-white text-[#f5576c] shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <FiDroplet className="text-sm" />
                Colors & Logo
              </button>
              <button
                type="button"
                onClick={() => setDesignTab('style')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  designTab === 'style'
                    ? 'bg-white text-[#f5576c] shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <FiGrid className="text-sm" />
                Style
              </button>
              <button
                type="button"
                onClick={() => setDesignTab('templates')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  designTab === 'templates'
                    ? 'bg-white text-[#f5576c] shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <FiLayout className="text-sm" />
                Templates
              </button>
            </div>

            {/* Colors Tab Content */}
            <div className={designTab === 'colors' ? 'block' : 'hidden'}>
              <div className="space-y-4">
                {/* Color Pickers en grid */}
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    color={config.color}
                    onChange={(color) => onConfigChange({ ...config, color })}
                    label="QR Color"
                  />
                  <ColorPicker
                    color={config.backgroundColor || '#FFFFFF'}
                    onChange={(color) => onConfigChange({ ...config, backgroundColor: color })}
                    label="Background"
                  />
                </div>

                {/* Logo Upload - Compacto */}
                <div>
                  <label className="block text-white text-xs font-medium mb-2">
                    Logo (Optional)
                    {!canUseLogo() && (
                      <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-[#40B49D] to-[#2d8b7a] text-white text-[10px] font-bold rounded">
                        <FiStar className="w-2.5 h-2.5" /> STARTER
                      </span>
                    )}
                  </label>
                  {!config.logo ? (
                    <label
                      className="flex items-center justify-center gap-3 w-full h-20 border-2 border-dashed border-white/30 rounded-xl hover:border-white/60 hover:bg-white/5 transition-all cursor-pointer group"
                      onClick={(e) => {
                        if (!canUseLogo()) {
                          e.preventDefault();
                          showUpgradeModal('Logo in QR codes', 'starter');
                        }
                      }}
                    >
                      <FiUpload className="w-6 h-6 text-white/60 group-hover:text-white/80 transition-colors" />
                      <div className="text-left">
                        <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors font-semibold">
                          Click to upload
                        </p>
                        <p className="text-[10px] text-white/40">PNG, JPG (max 2MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (!canUseLogo()) {
                            e.preventDefault();
                            showUpgradeModal('Logo in QR codes', 'starter');
                            return;
                          }
                          const file = e.target.files?.[0];
                          if (file) {
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
                    <div className="relative w-full h-20 border-2 border-white/30 rounded-xl overflow-hidden bg-white/10 backdrop-blur">
                      <Image
                        src={config.logo}
                        alt="Logo"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => onConfigChange({ ...config, logo: undefined })}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Remove logo"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 backdrop-blur rounded text-white text-[10px]">
                        <FiImage className="inline mr-1" />
                        Logo added
                      </div>
                    </div>
                  )}
                </div>

                {/* Size & Format */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="size" className="block text-white text-xs font-medium mb-1">
                      Size
                    </label>
                    <select
                      id="size"
                      value={config.size}
                      onChange={(e) => onConfigChange({ ...config, size: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur rounded-lg border-none outline-none text-sm"
                    >
                      {QR_SIZES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label.replace(' (', ' - ').replace('px)', '')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="format" className="block text-white text-xs font-medium mb-1">
                      Format
                    </label>
                    <select
                      id="format"
                      value={config.format}
                      onChange={(e) => onConfigChange({ ...config, format: e.target.value as 'png' | 'svg' })}
                      className="w-full px-3 py-2 bg-white/90 backdrop-blur rounded-lg border-none outline-none text-sm"
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
            </div>

            {/* Style Tab Content */}
            <div className={designTab === 'style' ? 'block' : 'hidden'}>
              <div className="space-y-4">
                {/* Dot Style Selector */}
                <div>
                  <label className="block text-white text-xs font-medium mb-2">
                    Dot Style
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {DOT_STYLES.map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => onConfigChange({ ...config, dotStyle: style.value as DotStyle })}
                        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-all ${
                          (config.dotStyle || 'square') === style.value
                            ? 'bg-white text-[#f5576c] border-white shadow-lg'
                            : 'bg-white/5 text-white border-white/30 hover:bg-white/10 hover:border-white/50'
                        }`}
                        title={style.label}
                      >
                        <div className="w-6 h-6 flex items-center justify-center">
                          {style.value === 'square' && <FiSquare className="text-base" />}
                          {style.value === 'dots' && <FiCircle className="text-base" />}
                          {style.value === 'rounded' && (
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                              <rect x="4" y="4" width="16" height="16" rx="4" />
                            </svg>
                          )}
                          {style.value === 'extra-rounded' && (
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                              <rect x="4" y="4" width="16" height="16" rx="8" />
                            </svg>
                          )}
                          {style.value === 'classy' && (
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                              <path d="M4 4h16v12a4 4 0 01-4 4H4V4z" />
                            </svg>
                          )}
                          {style.value === 'classy-rounded' && (
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                              <path d="M8 4h12v12a4 4 0 01-4 4H8a4 4 0 01-4-4V8a4 4 0 014-4z" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Style Selector */}
                <div>
                  <label className="block text-white text-xs font-medium mb-2">
                    Corner Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CORNER_STYLES.map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => onConfigChange({ ...config, cornerStyle: style.value as CornerStyle })}
                        className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all ${
                          (config.cornerStyle || 'square') === style.value
                            ? 'bg-white text-[#f5576c] border-white shadow-lg'
                            : 'bg-white/5 text-white border-white/30 hover:bg-white/10 hover:border-white/50'
                        }`}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          {style.value === 'square' && <FiSquare className="text-sm" />}
                          {style.value === 'dot' && <FiCircle className="text-sm" />}
                          {style.value === 'extra-rounded' && (
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                              <rect x="4" y="4" width="16" height="16" rx="8" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[10px] font-medium">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Color (optional) - disabled when gradient is enabled */}
                <div className={`space-y-2 ${config.gradientEnabled ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useCornerColor"
                      checked={!!config.cornerColor && !config.gradientEnabled}
                      disabled={config.gradientEnabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onConfigChange({ ...config, cornerColor: config.color });
                        } else {
                          onConfigChange({ ...config, cornerColor: undefined });
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="useCornerColor" className="text-white/70 text-xs">
                      Different corner color {config.gradientEnabled && '(disabled with gradient)'}
                    </label>
                  </div>
                  {config.cornerColor && !config.gradientEnabled && (
                    <div className="ml-6">
                      <ColorPicker
                        color={config.cornerColor}
                        onChange={(color) => onConfigChange({ ...config, cornerColor: color })}
                        label="Corner Color"
                      />
                    </div>
                  )}
                </div>

                {/* Gradient Options */}
                <div className="border-t border-white/20 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="gradientEnabled"
                      checked={config.gradientEnabled || false}
                      onChange={(e) => {
                        onConfigChange({
                          ...config,
                          gradientEnabled: e.target.checked,
                          gradientColorStart: e.target.checked ? config.color : undefined,
                          gradientColorEnd: e.target.checked ? '#8538a6' : undefined,
                          gradientType: 'linear',
                          gradientRotation: 45,
                          // Limpiar corner color cuando se activa gradiente
                          cornerColor: e.target.checked ? undefined : config.cornerColor,
                        });
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="gradientEnabled" className="text-white text-xs font-medium">
                      Enable Gradient
                    </label>
                  </div>

                  {config.gradientEnabled && (
                    <div className="space-y-2">
                      {/* Gradient Type */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onConfigChange({ ...config, gradientType: 'linear' })}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all ${
                            config.gradientType === 'linear'
                              ? 'bg-white text-[#f5576c]'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          Linear
                        </button>
                        <button
                          type="button"
                          onClick={() => onConfigChange({ ...config, gradientType: 'radial' })}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all ${
                            config.gradientType === 'radial'
                              ? 'bg-white text-[#f5576c]'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          Radial
                        </button>
                      </div>

                      {/* Gradient Colors */}
                      <div className="grid grid-cols-2 gap-2">
                        <ColorPicker
                          color={config.gradientColorStart || config.color}
                          onChange={(color) => onConfigChange({ ...config, gradientColorStart: color })}
                          label="Start"
                        />
                        <ColorPicker
                          color={config.gradientColorEnd || '#8538a6'}
                          onChange={(color) => onConfigChange({ ...config, gradientColorEnd: color })}
                          label="End"
                        />
                      </div>

                      {/* Gradient Rotation (only for linear) */}
                      {config.gradientType === 'linear' && (
                        <div>
                          <label className="block text-white text-[10px] font-medium mb-1">
                            Rotation: {config.gradientRotation || 0}°
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={config.gradientRotation || 0}
                            onChange={(e) => onConfigChange({ ...config, gradientRotation: Number(e.target.value) })}
                            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                          />
                        </div>
                      )}

                      {/* Gradient Preview */}
                      <div
                        className="h-4 rounded-lg"
                        style={{
                          background: config.gradientType === 'linear'
                            ? `linear-gradient(${config.gradientRotation || 0}deg, ${config.gradientColorStart || config.color}, ${config.gradientColorEnd || '#8538a6'})`
                            : `radial-gradient(circle, ${config.gradientColorStart || config.color}, ${config.gradientColorEnd || '#8538a6'})`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Templates Tab Content */}
            <div className={designTab === 'templates' ? 'block' : 'hidden'}>
              <TemplatesTab
                config={config}
                onApplyTemplate={(template: QRTemplate) => {
                  onConfigChange({
                    ...config,
                    color: template.style.color,
                    backgroundColor: template.style.backgroundColor,
                    dotStyle: template.style.dotStyle,
                    cornerStyle: template.style.cornerStyle,
                    cornerDotStyle: template.style.cornerDotStyle,
                    cornerColor: template.style.cornerColor,
                    gradientEnabled: template.style.gradientEnabled,
                    gradientType: template.style.gradientType,
                    gradientColorStart: template.style.gradientColorStart,
                    gradientColorEnd: template.style.gradientColorEnd,
                    gradientRotation: template.style.gradientRotation,
                    frameId: template.frameId,
                    frameColor: template.frameColor,
                    frameText: template.frameText,
                  });
                }}
                onApplyFrame={(frameId, color, text) => {
                  onConfigChange({
                    ...config,
                    frameId,
                    frameColor: color,
                    frameText: text,
                  });
                }}
                onClearFrame={() => {
                  onConfigChange({
                    ...config,
                    frameId: undefined,
                    frameColor: undefined,
                    frameText: undefined,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
