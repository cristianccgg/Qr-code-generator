"use client";

import { useState, useEffect } from 'react';
import { QRTemplate, TemplateCategory } from '@/types/templates';
import TemplateCard from './TemplateCard';

interface TemplateGalleryProps {
  category: TemplateCategory | 'all';
  showMyTemplates: boolean;
  onSelect: (template: QRTemplate) => void;
  selectedTemplateId?: string;
}

export default function TemplateGallery({
  category,
  showMyTemplates,
  onSelect,
  selectedTemplateId,
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<QRTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [category, showMyTemplates]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category !== 'all') {
        params.set('category', category);
      }
      if (showMyTemplates) {
        params.set('myOnly', 'true');
      }

      const res = await fetch(`/api/templates?${params}`);
      if (!res.ok) throw new Error('Failed to fetch templates');

      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (template: QRTemplate) => {
    if (!confirm(`Delete template "${template.name}"?`)) return;

    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      // Remove from list
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-white/10 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-white/60">
        <p>{error}</p>
        <button
          onClick={fetchTemplates}
          className="mt-2 text-sm text-white/80 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <p className="text-sm">
          {showMyTemplates
            ? 'No personal templates yet'
            : 'No templates found'}
        </p>
        {showMyTemplates && (
          <p className="text-xs mt-1">
            Save your current style to create one
          </p>
        )}
      </div>
    );
  }

  // Show scroll only when there are more than 6 templates (2 rows)
  const needsScroll = templates.length > 6;

  return (
    <div className={`grid grid-cols-3 gap-2 ${needsScroll ? 'max-h-60 overflow-y-auto pr-1' : ''}`}>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={selectedTemplateId === template.id}
          onSelect={onSelect}
          onDelete={handleDelete}
          showDelete={showMyTemplates}
        />
      ))}
    </div>
  );
}
