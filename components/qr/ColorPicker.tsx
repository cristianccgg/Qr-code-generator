'use client';

import { useState } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { IoColorPaletteOutline } from 'react-icons/io5';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

export default function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (color: ColorResult) => {
    onChange(color.hex);
  };

  return (
    <div>
      <label className="block text-white text-xs font-medium mb-2">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-full flex items-center gap-3 bg-white/90 backdrop-blur rounded-xl px-4 py-3 hover:bg-white transition-all"
        >
          <div
            className="w-10 h-10 rounded-lg border-2 border-gray-200 shadow-sm"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-gray-800">
              {label}
            </div>
            <div className="text-xs font-mono text-gray-500 uppercase">
              {color}
            </div>
          </div>
          <IoColorPaletteOutline className="text-gray-400 text-xl" />
        </button>

        {showPicker && (
          <>
            {/* Overlay para cerrar el picker */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPicker(false)}
            />

            {/* Color Picker */}
            <div className="absolute z-20 top-full mt-2 left-0 animate-fadeIn">
              <SketchPicker
                color={color}
                onChange={handleChange}
                disableAlpha={false}
                presetColors={[
                  '#000000',
                  '#f5576c',
                  '#8538a6',
                  '#7386bf',
                  '#f2cb57',
                  '#40B49D',
                  '#FFFFFF',
                  '#FF6B6B',
                  '#4ECDC4',
                  '#45B7D1',
                  '#96CEB4',
                  '#FFEAA7',
                  '#DFE6E9',
                  '#74B9FF',
                  '#A29BFE',
                  '#FD79A8',
                ]}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
