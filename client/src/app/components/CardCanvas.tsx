'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, FabricImage, Textbox, Shadow, type FabricObject } from 'fabric';
import CanvasToolbar from './CanvasToolbar';

interface CardCanvasProps {
  imageUrl: string;
  aspectRatio: string;
  initialText?: string;
  canvasJson?: Record<string, any>;
  onSave: (compositeDataUrl: string, canvasJson: Record<string, any>) => void;
  onCancel: () => void;
}

const CANVAS_WIDTH = 600;

function getCanvasHeight(aspectRatio: string): number {
  const [w, h] = aspectRatio.split(':').map(Number);
  if (!w || !h) return 840;
  return Math.round(CANVAS_WIDTH * (h / w));
}

export default function CardCanvas({
  imageUrl,
  aspectRatio,
  initialText,
  canvasJson,
  onSave,
  onCancel,
}: CardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const sourceDimensionsRef = useRef({ width: CANVAS_WIDTH, height: getCanvasHeight(aspectRatio) });

  const [selectedFont, setSelectedFont] = useState('Playfair Display');
  const [selectedSize, setSelectedSize] = useState(36);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState('center');
  const [hasSelection, setHasSelection] = useState(false);

  const canvasHeight = getCanvasHeight(aspectRatio);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: canvasHeight,
      backgroundColor: '#ffffff',
    });

    fabricRef.current = canvas;

    // Load background image
    FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
      sourceDimensionsRef.current = {
        width: img.width || CANVAS_WIDTH,
        height: img.height || canvasHeight,
      };

      const sourceW = img.width || CANVAS_WIDTH;
      const sourceH = img.height || canvasHeight;
      const scale = Math.max(CANVAS_WIDTH / sourceW, canvasHeight / sourceH);
      img.scale(scale);
      img.set({
        left: CANVAS_WIDTH / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
      });
      canvas.insertAt(0, img);
      canvas.renderAll();

      // Load saved canvas JSON if available (re-editing)
      if (canvasJson) {
        canvas.loadFromJSON(JSON.stringify(canvasJson)).then(() => {
          // Lock background image again after load
          const objects = canvas.getObjects();
          if (objects.length > 0 && objects[0] instanceof FabricImage) {
            objects[0].set({
              selectable: false,
              evented: false,
              lockMovementX: true,
              lockMovementY: true,
            });
          }
          canvas.renderAll();
        });
      } else if (initialText) {
        // Add initial text if provided
        const text = new Textbox(initialText, {
          left: CANVAS_WIDTH / 2,
          top: canvasHeight * 0.1,
          originX: 'center',
          width: CANVAS_WIDTH * 0.8,
          fontFamily: selectedFont,
          fontSize: selectedSize,
          fill: selectedColor,
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
          shadow: new Shadow({ color: 'rgba(0,0,0,0.5)', offsetX: 2, offsetY: 2, blur: 4 }),
        });
        canvas.add(text);
        canvas.renderAll();
      }
    });

    // Selection tracking
    canvas.on('selection:created', () => {
      setHasSelection(true);
      syncToolbarFromSelection(canvas);
    });
    canvas.on('selection:updated', () => {
      setHasSelection(true);
      syncToolbarFromSelection(canvas);
    });
    canvas.on('selection:cleared', () => {
      setHasSelection(false);
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [imageUrl, aspectRatio]);

  const syncToolbarFromSelection = (canvas: Canvas) => {
    const active = canvas.getActiveObject();
    if (active && active instanceof Textbox) {
      setSelectedFont(active.fontFamily || 'Playfair Display');
      setSelectedSize(active.fontSize || 36);
      setSelectedColor((active.fill as string) || '#FFFFFF');
      setIsBold(active.fontWeight === 'bold');
      setIsItalic(active.fontStyle === 'italic');
      setTextAlign(active.textAlign || 'center');
    }
  };

  const getActiveTextbox = (): Textbox | null => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    const active = canvas.getActiveObject();
    if (active && active instanceof Textbox) return active;
    return null;
  };

  const handleFontChange = useCallback((font: string) => {
    setSelectedFont(font);
    const tb = getActiveTextbox();
    if (tb) {
      tb.set('fontFamily', font);
      fabricRef.current?.renderAll();
    }
  }, []);

  const handleSizeChange = useCallback((size: number) => {
    setSelectedSize(size);
    const tb = getActiveTextbox();
    if (tb) {
      tb.set('fontSize', size);
      fabricRef.current?.renderAll();
    }
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
    const tb = getActiveTextbox();
    if (tb) {
      tb.set('fill', color);
      fabricRef.current?.renderAll();
    }
  }, []);

  const handleBoldToggle = useCallback(() => {
    const next = !isBold;
    setIsBold(next);
    const tb = getActiveTextbox();
    if (tb) {
      tb.set('fontWeight', next ? 'bold' : 'normal');
      fabricRef.current?.renderAll();
    }
  }, [isBold]);

  const handleItalicToggle = useCallback(() => {
    const next = !isItalic;
    setIsItalic(next);
    const tb = getActiveTextbox();
    if (tb) {
      tb.set('fontStyle', next ? 'italic' : 'normal');
      fabricRef.current?.renderAll();
    }
  }, [isItalic]);

  const handleAlignChange = useCallback((align: string) => {
    setTextAlign(align);
    const tb = getActiveTextbox();
    if (tb) {
      tb.set('textAlign', align);
      fabricRef.current?.renderAll();
    }
  }, []);

  const handleAddText = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const text = new Textbox('Your text here', {
      left: CANVAS_WIDTH / 2,
      top: canvasHeight / 2,
      originX: 'center',
      originY: 'center',
      width: CANVAS_WIDTH * 0.7,
      fontFamily: selectedFont,
      fontSize: selectedSize,
      fill: selectedColor,
      textAlign: textAlign as 'left' | 'center' | 'right',
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      shadow: new Shadow({ color: 'rgba(0,0,0,0.5)', offsetX: 2, offsetY: 2, blur: 4 }),
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }, [selectedFont, selectedSize, selectedColor, textAlign, isBold, isItalic, canvasHeight]);

  const handleDeleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active.selectable) {
      canvas.remove(active);
      canvas.renderAll();
    }
  }, []);

  const handleBringForward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringObjectForward(active);
      canvas.renderAll();
    }
  }, []);

  const handleSendBackward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      // Don't send behind background image
      const objects = canvas.getObjects();
      const idx = objects.indexOf(active as FabricObject);
      if (idx > 1) {
        canvas.sendObjectBackwards(active);
        canvas.renderAll();
      }
    }
  }, []);

  const handleSave = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Deselect to remove selection handles from export
    canvas.discardActiveObject();
    canvas.renderAll();

    const { width: sourceWidth, height: sourceHeight } = sourceDimensionsRef.current;
    const widthMultiplier = sourceWidth > 0 ? sourceWidth / CANVAS_WIDTH : 1;
    const heightMultiplier = sourceHeight > 0 ? sourceHeight / canvasHeight : 1;
    const exportMultiplier = Math.max(1, widthMultiplier, heightMultiplier);

    const dataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: Number(exportMultiplier.toFixed(2)),
    });

    const json = canvas.toJSON();

    onSave(dataUrl, json);
  }, [canvasHeight, onSave]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Canvas */}
      <div className="flex-1">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-100 mx-auto"
          style={{ maxWidth: CANVAS_WIDTH }}
        >
          <canvas ref={canvasRef} />
        </div>

        {/* Safe Area Guide Info */}
        <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">
          Keep important elements within the inner area for print safety margins
        </p>
      </div>

      {/* Toolbar */}
      <div className="w-full lg:w-64 shrink-0">
        <CanvasToolbar
          selectedFont={selectedFont}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          isBold={isBold}
          isItalic={isItalic}
          textAlign={textAlign}
          hasSelection={hasSelection}
          onFontChange={handleFontChange}
          onSizeChange={handleSizeChange}
          onColorChange={handleColorChange}
          onBoldToggle={handleBoldToggle}
          onItalicToggle={handleItalicToggle}
          onAlignChange={handleAlignChange}
          onAddText={handleAddText}
          onDeleteSelected={handleDeleteSelected}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
        />

        {/* Save / Cancel */}
        <div className="mt-4 space-y-3">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all"
          >
            Save & Continue
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-500 hover:border-black hover:text-black transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
