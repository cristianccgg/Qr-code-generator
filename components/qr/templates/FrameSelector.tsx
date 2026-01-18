"use client";

import { useState } from 'react';
import { PREDEFINED_FRAMES, getFrameById } from '@/lib/frames';
import { FiX } from 'react-icons/fi';
import ColorPicker from '../ColorPicker';

interface FrameSelectorProps {
  currentFrameId?: string;
  frameColor?: string;
  frameText?: string;
  onSelect: (frameId: string, color?: string, text?: string) => void;
  onClear: () => void;
}

export default function FrameSelector({
  currentFrameId,
  frameColor,
  frameText,
  onSelect,
  onClear,
}: FrameSelectorProps) {
  const selectedFrame = currentFrameId ? getFrameById(currentFrameId) : null;
  const [localColor, setLocalColor] = useState(frameColor || selectedFrame?.defaultColor || '#000000');
  const [localText, setLocalText] = useState(frameText || selectedFrame?.defaultText || '');

  const handleFrameSelect = (frameId: string) => {
    const frame = getFrameById(frameId);
    if (!frame) return;

    const newColor = frame.defaultColor;
    const newText = frame.defaultText || '';

    setLocalColor(newColor);
    setLocalText(newText);
    onSelect(frameId, newColor, newText);
  };

  const handleColorChange = (color: string) => {
    setLocalColor(color);
    if (currentFrameId) {
      onSelect(currentFrameId, color, localText);
    }
  };

  const handleTextChange = (text: string) => {
    setLocalText(text);
    if (currentFrameId) {
      onSelect(currentFrameId, localColor, text);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Frame Options */}
      {selectedFrame && (
        <div className="bg-white/10 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-medium">
              {selectedFrame.name}
            </span>
            <button
              onClick={onClear}
              className="text-white/60 hover:text-white text-xs flex items-center gap-1"
            >
              <FiX className="text-sm" />
              Remove
            </button>
          </div>

          {/* Frame Color */}
          <ColorPicker
            color={localColor}
            onChange={handleColorChange}
            label="Frame Color"
          />

          {/* Frame Text */}
          {selectedFrame.hasCustomText && (
            <div>
              <label className="block text-white text-xs font-medium mb-1.5">
                Frame Text
              </label>
              <input
                type="text"
                value={localText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={selectedFrame.defaultText || 'Enter text...'}
                maxLength={20}
                className="w-full px-3 py-2 bg-white/90 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          )}
        </div>
      )}

      {/* Frame Gallery */}
      <div>
        <label className="block text-white text-xs font-medium mb-2">
          {selectedFrame ? 'Change Frame' : 'Select a Frame'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PREDEFINED_FRAMES.map((frame) => (
            <button
              key={frame.id}
              onClick={() => handleFrameSelect(frame.id)}
              className={`rounded-xl overflow-hidden border-2 transition-all ${
                currentFrameId === frame.id
                  ? 'border-white ring-2 ring-white/50'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              {/* Frame preview with QR placeholder */}
              <div className="bg-white p-2 aspect-square flex flex-col items-center justify-center">
                {/* Top bar for frames with header */}
                {frame.hasCustomText && (
                  <div
                    className="w-full h-2 rounded-t mb-1"
                    style={{ backgroundColor: frame.defaultColor }}
                  />
                )}
                {/* QR placeholder */}
                <div
                  className="w-3/4 aspect-square rounded-sm"
                  style={{ backgroundColor: frame.defaultColor }}
                />
                {/* Text placeholder */}
                {frame.hasCustomText && (
                  <div
                    className="mt-1 px-1 py-0.5 rounded text-[6px] font-bold text-white"
                    style={{ backgroundColor: frame.defaultColor }}
                  >
                    {frame.defaultText?.slice(0, 8) || 'TEXT'}
                  </div>
                )}
              </div>
              {/* Frame name */}
              <div className="bg-black/60 py-1">
                <span className="text-[9px] text-white/90 font-medium">
                  {frame.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* No frame option */}
      {currentFrameId && (
        <button
          onClick={onClear}
          className="w-full py-2 text-white/60 hover:text-white text-xs border border-dashed border-white/20 rounded-lg hover:border-white/40 transition-all"
        >
          No Frame
        </button>
      )}
    </div>
  );
}
