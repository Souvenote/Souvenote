'use client';

import React from 'react';
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const FONTS = [
  'Playfair Display',
  'Dancing Script',
  'Inter',
  'Lobster',
  'Montserrat',
  'Lora',
  'Pacifico',
  'Raleway',
];

const COLORS = [
  '#000000', '#FFFFFF', '#EF4444', '#F59E0B', '#10B981',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#D4AF37',
];

interface CanvasToolbarProps {
  selectedFont: string;
  selectedSize: number;
  selectedColor: string;
  isBold: boolean;
  isItalic: boolean;
  textAlign: string;
  hasSelection: boolean;
  onFontChange: (font: string) => void;
  onSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  onBoldToggle: () => void;
  onItalicToggle: () => void;
  onAlignChange: (align: string) => void;
  onAddText: () => void;
  onDeleteSelected: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

export default function CanvasToolbar({
  selectedFont,
  selectedSize,
  selectedColor,
  isBold,
  isItalic,
  textAlign,
  hasSelection,
  onFontChange,
  onSizeChange,
  onColorChange,
  onBoldToggle,
  onItalicToggle,
  onAlignChange,
  onAddText,
  onDeleteSelected,
  onBringForward,
  onSendBackward,
}: CanvasToolbarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 space-y-4">
      {/* Add Text */}
      <button
        onClick={onAddText}
        className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
      >
        <Plus className="w-4 h-4" /> Add Text
      </button>

      {/* Font Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Font</label>
        <select
          value={selectedFont}
          onChange={(e) => onFontChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
        >
          {FONTS.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Size Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Size</label>
          <span className="text-xs font-bold text-gray-600">{selectedSize}px</span>
        </div>
        <input
          type="range"
          min={12}
          max={120}
          value={selectedSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-full accent-black"
        />
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                selectedColor === color ? 'border-black scale-110' : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Text Formatting */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Format</label>
        <div className="flex gap-2">
          <button
            onClick={onBoldToggle}
            className={`flex-1 py-2 rounded-lg border transition-all flex items-center justify-center ${
              isBold ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={onItalicToggle}
            className={`flex-1 py-2 rounded-lg border transition-all flex items-center justify-center ${
              isItalic ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Align</label>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onAlignChange(value)}
              className={`flex-1 py-2 rounded-lg border transition-all flex items-center justify-center ${
                textAlign === value ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Layer Controls */}
      {hasSelection && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Layer</label>
          <div className="flex gap-2">
            <button
              onClick={onBringForward}
              className="flex-1 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1 text-xs font-bold"
            >
              <ArrowUp className="w-3 h-3" /> Forward
            </button>
            <button
              onClick={onSendBackward}
              className="flex-1 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1 text-xs font-bold"
            >
              <ArrowDown className="w-3 h-3" /> Back
            </button>
          </div>
          <button
            onClick={onDeleteSelected}
            className="w-full py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-1 text-xs font-bold"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
