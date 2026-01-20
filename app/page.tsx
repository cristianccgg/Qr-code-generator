'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import QRForm from '@/components/qr/QRForm';
import QRPreview from '@/components/qr/QRPreview';
import { QRConfig } from '@/types/qr';
import {
  FiZap,
  FiEdit3,
  FiBarChart2,
  FiDownload,
  FiSmartphone,
  FiCoffee,
  FiShoppingBag,
  FiCalendar,
  FiArrowRight,
  FiCheck,
  FiLayers,
  FiRefreshCw
} from 'react-icons/fi';

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

  const features = [
    {
      icon: FiLayers,
      title: '7 QR Types',
      description: 'URL, Text, Email, Phone, SMS, WiFi, and vCard',
    },
    {
      icon: FiEdit3,
      title: 'Fully Customizable',
      description: '6 dot styles, gradients, colors, and your logo',
    },
    {
      icon: FiRefreshCw,
      title: 'Dynamic QR Codes',
      description: 'Change destination anytime without reprinting',
    },
    {
      icon: FiBarChart2,
      title: 'Scan Analytics',
      description: 'Track scans by location, device, and time',
    },
    {
      icon: FiDownload,
      title: 'Multiple Formats',
      description: 'Download as PNG, SVG, or PDF',
    },
    {
      icon: FiSmartphone,
      title: 'Works Everywhere',
      description: 'Compatible with all QR scanners',
    },
  ];

  const useCases = [
    {
      icon: FiCoffee,
      title: 'Restaurants & Cafes',
      description: 'Digital menus, WiFi access, reviews',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: FiShoppingBag,
      title: 'Retail & E-commerce',
      description: 'Product info, promotions, store locator',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FiCalendar,
      title: 'Events & Marketing',
      description: 'Registration, tickets, social links',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Choose Type',
      description: 'Select what you want to encode: URL, text, contact info, or more',
    },
    {
      number: '2',
      title: 'Customize Style',
      description: 'Pick colors, patterns, add your logo to match your brand',
    },
    {
      number: '3',
      title: 'Download & Use',
      description: 'Get your QR code in PNG, SVG, or PDF format instantly',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with QR Generator */}
      <div className="bg-gradient-to-br from-[#f5576c] via-[#8538a6] to-[#7386bf] relative overflow-hidden">
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
                Create Beautiful QR Codes
              </h1>
              <p className="text-white/90 text-sm lg:text-xl font-medium max-w-2xl mx-auto hidden lg:block">
                Free QR code generator with custom styles, logos, and colors.
                Track scans with dynamic QR codes.
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
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create your perfect QR code in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-300 to-pink-300"></div>
                )}

                <div className="relative bg-white text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional QR code tools for individuals and businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 text-purple-600 mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Static vs Dynamic Comparison */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Static vs Dynamic QR Codes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the right type for your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Static */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="inline-block px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium mb-4">
                Free Forever
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Static QR Codes</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Content encoded directly in QR</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Works offline, no internet needed</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Unlimited QR codes for free</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="mt-1 flex-shrink-0">✕</span>
                  <span>Cannot be edited after creation</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="mt-1 flex-shrink-0">✕</span>
                  <span>No scan tracking or analytics</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500">
                Best for: Permanent content like WiFi passwords, contact cards
              </p>
            </div>

            {/* Dynamic */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 relative">
              <div className="absolute -top-3 right-4 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium">
                Recommended
              </div>
              <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                From $5/month
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Dynamic QR Codes</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <FiCheck className="text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Change destination URL anytime</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Track every scan with analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">See location, device, browser data</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Fix mistakes without reprinting</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheck className="text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">Organize with campaigns</span>
                </li>
              </ul>
              <p className="text-sm text-gray-600">
                Best for: Marketing campaigns, menus, products, events
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Perfect For Every Industry
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how businesses use QR codes to connect with customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className={`h-2 bg-gradient-to-r ${useCase.color}`}></div>
                <div className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${useCase.color} text-white mb-4`}>
                    <useCase.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {useCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Create Your QR Code?
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8">
            Start free with unlimited static QR codes, or upgrade for dynamic QR codes with analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Create Free QR Code
              <FiArrowRight />
            </a>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/30"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
