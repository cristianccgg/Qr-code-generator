"use client";

import { QRTemplate } from '@/types/templates';
import { FiCheck, FiTrash2 } from 'react-icons/fi';

interface TemplateCardProps {
  template: QRTemplate;
  isSelected?: boolean;
  onSelect: (template: QRTemplate) => void;
  onDelete?: (template: QRTemplate) => void;
  showDelete?: boolean;
}

export default function TemplateCard({
  template,
  isSelected = false,
  onSelect,
  onDelete,
  showDelete = false,
}: TemplateCardProps) {
  // QR dot color (or gradient start color)
  const dotColor = template.style.gradientEnabled
    ? template.style.gradientColorStart || template.style.color
    : template.style.color;

  return (
    <button
      onClick={() => onSelect(template)}
      className={`relative group w-full rounded-xl overflow-hidden border-2 transition-all ${
        isSelected
          ? 'border-white ring-2 ring-white/50'
          : 'border-white/20 hover:border-white/40'
      }`}
    >
      {/* Preview - Simple QR representation */}
      <div
        className="w-full aspect-square p-3"
        style={{ backgroundColor: template.style.backgroundColor }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Corner squares - simplified */}
          <rect x="5" y="5" width="25" height="25" rx="2" fill={dotColor} />
          <rect x="9" y="9" width="17" height="17" fill={template.style.backgroundColor} />
          <rect x="13" y="13" width="9" height="9" fill={dotColor} />

          <rect x="70" y="5" width="25" height="25" rx="2" fill={dotColor} />
          <rect x="74" y="9" width="17" height="17" fill={template.style.backgroundColor} />
          <rect x="78" y="13" width="9" height="9" fill={dotColor} />

          <rect x="5" y="70" width="25" height="25" rx="2" fill={dotColor} />
          <rect x="9" y="74" width="17" height="17" fill={template.style.backgroundColor} />
          <rect x="13" y="78" width="9" height="9" fill={dotColor} />

          {/* Center pattern - varies by dot style */}
          {template.style.dotStyle === 'dots' || template.style.dotStyle === 'rounded' ? (
            <>
              <circle cx="50" cy="50" r="5" fill={dotColor} />
              <circle cx="40" cy="40" r="3" fill={dotColor} />
              <circle cx="60" cy="40" r="3" fill={dotColor} />
              <circle cx="40" cy="60" r="3" fill={dotColor} />
              <circle cx="60" cy="60" r="3" fill={dotColor} />
            </>
          ) : (
            <>
              <rect x="45" y="45" width="10" height="10" fill={dotColor} />
              <rect x="36" y="36" width="6" height="6" fill={dotColor} />
              <rect x="58" y="36" width="6" height="6" fill={dotColor} />
              <rect x="36" y="58" width="6" height="6" fill={dotColor} />
              <rect x="58" y="58" width="6" height="6" fill={dotColor} />
            </>
          )}
        </svg>
      </div>

      {/* Frame indicator badge */}
      {template.frameId && (
        <div
          className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
          style={{
            backgroundColor: template.frameColor || dotColor,
            color: template.style.backgroundColor,
          }}
        >
          Frame
        </div>
      )}

      {/* Template name - bottom bar */}
      <div className="bg-black/60 px-2 py-1.5">
        <p className="text-white text-[10px] font-medium truncate text-center">
          {template.name}
        </p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
          <FiCheck className="text-[#f5576c] text-xs" />
        </div>
      )}

      {/* Delete button (for personal templates) */}
      {showDelete && !template.isSystem && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template);
          }}
          className="absolute top-2 left-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FiTrash2 className="text-white text-[10px]" />
        </button>
      )}
    </button>
  );
}
