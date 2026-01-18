"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { QRConfig } from '@/types/qr';
import { QRTemplate, TemplateCategory, QRStyleConfig, TEMPLATE_CATEGORIES } from '@/types/templates';
import TemplateGallery from './TemplateGallery';
import FrameSelector from './FrameSelector';
import SaveTemplateModal from './SaveTemplateModal';
import { FiGrid, FiSquare, FiPlus } from 'react-icons/fi';

type ViewMode = 'templates' | 'frames';

interface TemplatesTabProps {
  config: QRConfig;
  onApplyTemplate: (template: QRTemplate) => void;
  onApplyFrame: (frameId: string, color?: string, text?: string) => void;
  onClearFrame: () => void;
}

export default function TemplatesTab({
  config,
  onApplyTemplate,
  onApplyFrame,
  onClearFrame,
}: TemplatesTabProps) {
  const { data: session } = useSession();
  const [view, setView] = useState<ViewMode>('templates');
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all');
  const [showMyTemplates, setShowMyTemplates] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();

  const handleSelectTemplate = (template: QRTemplate) => {
    setSelectedTemplateId(template.id);
    onApplyTemplate(template);
  };

  const handleSaveTemplate = async (
    name: string,
    description: string,
    templateCategory: TemplateCategory
  ) => {
    const style: QRStyleConfig = {
      color: config.color,
      backgroundColor: config.backgroundColor || '#FFFFFF',
      dotStyle: config.dotStyle || 'square',
      cornerStyle: config.cornerStyle || 'square',
      cornerDotStyle: config.cornerDotStyle || 'square',
      cornerColor: config.cornerColor,
      gradientEnabled: config.gradientEnabled || false,
      gradientType: config.gradientType,
      gradientColorStart: config.gradientColorStart,
      gradientColorEnd: config.gradientColorEnd,
      gradientRotation: config.gradientRotation,
    };

    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        category: templateCategory,
        style,
        frameId: config.frameId,
        frameColor: config.frameColor,
        frameText: config.frameText,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to save template');
    }

    // Refresh to show new template
    setShowMyTemplates(true);
  };

  return (
    <div className="space-y-4">
      {/* View Toggle: Templates vs Frames */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('templates')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            view === 'templates'
              ? 'bg-white text-[#f5576c]'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <FiGrid className="text-sm" />
          Templates
        </button>
        <button
          onClick={() => setView('frames')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            view === 'frames'
              ? 'bg-white text-[#f5576c]'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <FiSquare className="text-sm" />
          Frames
        </button>
      </div>

      {view === 'templates' ? (
        <>
          {/* Category Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => {
                setCategory('all');
                setShowMyTemplates(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                category === 'all' && !showMyTemplates
                  ? 'bg-white text-[#f5576c]'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              All
            </button>
            {TEMPLATE_CATEGORIES.filter(c => c.value !== 'general').map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setShowMyTemplates(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  category === cat.value && !showMyTemplates
                    ? 'bg-white text-[#f5576c]'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
            {session && (
              <button
                onClick={() => {
                  setShowMyTemplates(true);
                  setCategory('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  showMyTemplates
                    ? 'bg-white text-[#f5576c]'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                My Templates
              </button>
            )}
          </div>

          {/* Template Gallery */}
          <TemplateGallery
            category={category}
            showMyTemplates={showMyTemplates}
            onSelect={handleSelectTemplate}
            selectedTemplateId={selectedTemplateId}
          />

          {/* Save Current Style as Template */}
          {session && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="w-full py-3 border-2 border-dashed border-white/30 rounded-xl text-white/70 hover:border-white/50 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
            >
              <FiPlus className="text-base" />
              Save Current Style as Template
            </button>
          )}
        </>
      ) : (
        /* Frames View */
        <FrameSelector
          currentFrameId={config.frameId}
          frameColor={config.frameColor}
          frameText={config.frameText}
          onSelect={onApplyFrame}
          onClear={onClearFrame}
        />
      )}

      {/* Save Template Modal */}
      {showSaveModal && (
        <SaveTemplateModal
          config={config}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveTemplate}
        />
      )}
    </div>
  );
}
