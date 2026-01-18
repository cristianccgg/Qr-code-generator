"use client";

import { useState } from 'react';
import { QRConfig } from '@/types/qr';
import { TemplateCategory, TEMPLATE_CATEGORIES } from '@/types/templates';
import { FiX, FiSave } from 'react-icons/fi';

interface SaveTemplateModalProps {
  config: QRConfig;
  onClose: () => void;
  onSave: (name: string, description: string, category: TemplateCategory) => Promise<void>;
}

export default function SaveTemplateModal({
  config,
  onClose,
  onSave,
}: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('general');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(name.trim(), description.trim(), category);
      onClose();
    } catch (err) {
      setError('Failed to save template');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Generate preview color for the modal
  const previewColor = config.gradientEnabled
    ? config.gradientColorStart || config.color
    : config.color;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#f5576c] to-[#f093fb] rounded-2xl p-1 max-w-sm w-full">
        <div className="bg-gray-900 rounded-xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Save as Template</h3>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Preview */}
          <div className="mb-4 flex justify-center">
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: config.backgroundColor || '#FFFFFF' }}
            >
              <div
                className="w-12 h-12 rounded"
                style={{ backgroundColor: previewColor }}
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Custom Template"
                maxLength={50}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/50"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description..."
                maxLength={100}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-white/50"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-white text-xs font-medium mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/50"
              >
                {TEMPLATE_CATEGORIES.filter(c => c.value !== 'general' || true).map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-gray-800">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex-1 py-2 px-4 bg-white text-[#f5576c] rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiSave className="text-sm" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
