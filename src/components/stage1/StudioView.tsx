import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArtTemplate, ArtField, FieldHitBox } from '../../types';
import { wrapParagraphLines, slugify, isPointInBox } from '../../utils/textLayout';
import {
  Upload,
  Download,
  Plus,
  Copy,
  Trash2,
  Pipette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileCode,
  Image as ImageIcon,
  Edit3,
  Check
} from 'lucide-react';

interface StudioViewProps {
  template: ArtTemplate;
  templates: ArtTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onUpdateTemplate: (updated: ArtTemplate) => void;
  onCreateNewWithImage: (file: File) => void;
  onExportArt: (format: 'png' | 'jpg', canvas: HTMLCanvasElement) => void;
  onDownloadTemplateJson: (template: ArtTemplate) => void;
  onImportTemplateJson: (file: File) => void;
  showToast: (msg: string) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  template,
  templates,
  onSelectTemplate,
  onUpdateTemplate,
  onCreateNewWithImage,
  onExportArt,
  onDownloadTemplateJson,
  onImportTemplateJson,
  showToast
}) => {
  const [subTab, setSubTab] = useState<'fill' | 'configure'>('fill');
  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    template.fields[0]?.id || ''
  );
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [eyedropperMode, setEyedropperMode] = useState<'text' | 'bg' | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImageCache = useRef<Record<string, HTMLImageElement>>({});
  const fieldHitBoxes = useRef<Record<string, FieldHitBox>>({});
  const fileInputBgRef = useRef<HTMLInputElement | null>(null);
  const fileInputNewWithImgRef = useRef<HTMLInputElement | null>(null);
  const fileInputJsonRef = useRef<HTMLInputElement | null>(null);

  const pointerState = useRef<{
    type: 'drag' | 'resize' | null;
    fieldId: string | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origWidth: number;
  }>({
    type: null,
    fieldId: null,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    origWidth: 0
  });

  // Keep selectedFieldId valid
  useEffect(() => {
    if (!template.fields.some((f) => f.id === selectedFieldId)) {
      setSelectedFieldId(template.fields[0]?.id || '');
    }
  }, [template, selectedFieldId]);

  const selectedField = template.fields.find((f) => f.id === selectedFieldId) || template.fields[0];

  // Helper to draw rounded rectangle
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Render Canvas
  const renderCanvas = useCallback(
    (cleanExport = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (canvas.width !== template.width || canvas.height !== template.height) {
        canvas.width = template.width;
        canvas.height = template.height;
      }

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw base white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw background image
      const cached = bgImageCache.current[template.id];
      if (cached && cached.complete) {
        ctx.drawImage(cached, 0, 0, canvas.width, canvas.height);
      }

      if (!cleanExport) {
        fieldHitBoxes.current = {};
      }

      // 3. Render each field
      template.fields.forEach((field) => {
        const rawText = field.uppercase
          ? String(field.value ?? '').toUpperCase()
          : String(field.value ?? '');

        const fontSize = Number(field.fontSize) || 18;
        const fontWeight = field.fontWeight || '600';
        const fontFamily = field.fontFamily || 'Inter';
        const lineHeightPx = fontSize * (Number(field.lineHeight) || 1.25);
        const boxWidth = Math.max(30, Number(field.width) || 240);

        ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
        ctx.textBaseline = 'top';

        const lines = wrapParagraphLines(rawText, boxWidth, (str) => ctx.measureText(str).width);
        const boxHeight = Math.max(lineHeightPx, lines.length * lineHeightPx);

        // 3.1 Solid background stripe
        if (field.bgEnabled) {
          const pad = Number(field.bgPadding) || 0;
          const rad = Number(field.bgRadius) || 0;
          drawRoundedRect(
            ctx,
            field.x - pad,
            field.y - pad,
            boxWidth + pad * 2,
            boxHeight + pad * 2,
            rad
          );
          ctx.fillStyle = field.bgColor || '#ffffff';
          ctx.fill();
        }

        // 3.2 Text rendering
        ctx.fillStyle = field.color || '#000000';
        lines.forEach((lineObj, lineIdx) => {
          const ly = field.y + lineIdx * lineHeightPx;
          const lineStr = lineObj.words.join(' ');

          if (field.align === 'center') {
            ctx.textAlign = 'center';
            ctx.fillText(lineStr, field.x + boxWidth / 2, ly);
          } else if (field.align === 'right') {
            ctx.textAlign = 'right';
            ctx.fillText(lineStr, field.x + boxWidth, ly);
          } else if (field.align === 'justify' && !lineObj.isLastInParagraph && lineObj.words.length > 1) {
            ctx.textAlign = 'left';
            const totalWordsW = lineObj.words.reduce((acc, w) => acc + ctx.measureText(w).width, 0);
            const spaceW = (boxWidth - totalWordsW) / (lineObj.words.length - 1);
            let curX = field.x;
            lineObj.words.forEach((w) => {
              ctx.fillText(w, curX, ly);
              curX += ctx.measureText(w).width + spaceW;
            });
          } else {
            ctx.textAlign = 'left';
            ctx.fillText(lineStr, field.x, ly);
          }
        });

        // 3.3 Hitboxes and Guides
        if (!cleanExport) {
          fieldHitBoxes.current[field.id] = {
            x: field.x,
            y: field.y,
            w: boxWidth,
            h: boxHeight,
            handleX: field.x + boxWidth,
            handleY: field.y + boxHeight / 2
          };

          const isSelected = field.id === selectedFieldId;
          if (showGuides || isSelected) {
            ctx.save();
            ctx.strokeStyle = isSelected ? '#f59e0b' : 'rgba(16, 185, 129, 0.65)';
            ctx.lineWidth = isSelected ? 2 : 1.2;
            ctx.setLineDash(isSelected ? [] : [5, 4]);
            ctx.strokeRect(field.x - 4, field.y - 4, boxWidth + 8, boxHeight + 8);

            if (isSelected) {
              // Field name badge
              ctx.font = '700 11px "Inter", sans-serif';
              const tagText = field.label || 'Campo';
              const tagW = ctx.measureText(tagText).width + 12;
              const tagY = Math.max(0, field.y - 22);
              ctx.fillStyle = '#f59e0b';
              ctx.fillRect(field.x - 4, tagY, tagW, 18);
              ctx.fillStyle = '#090d16';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillText(tagText, field.x + 2, tagY + 9);

              // Width resize handle
              ctx.beginPath();
              ctx.arc(field.x + boxWidth + 4, field.y + boxHeight / 2, 6.5, 0, Math.PI * 2);
              ctx.fillStyle = '#f59e0b';
              ctx.fill();
              ctx.lineWidth = 2;
              ctx.strokeStyle = '#090d16';
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      });

      ctx.restore();
    },
    [template, selectedFieldId, showGuides]
  );

  // Load and cache background image whenever template or dataUrl changes
  useEffect(() => {
    if (!template.backgroundDataUrl) {
      renderCanvas();
      return;
    }

    const cached = bgImageCache.current[template.id];
    if (cached && cached.src === template.backgroundDataUrl && cached.complete) {
      renderCanvas();
      return;
    }

    const img = new Image();
    img.onload = () => {
      bgImageCache.current[template.id] = img;
      renderCanvas();
    };
    img.src = template.backgroundDataUrl;
  }, [template.id, template.backgroundDataUrl, renderCanvas]);

  // Redraw when fields or guides change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Update a single field property
  const updateField = (fieldId: string, updates: Partial<ArtField>) => {
    const newFields = template.fields.map((f) => {
      if (f.id === fieldId) {
        return { ...f, ...updates };
      }
      return f;
    });
    onUpdateTemplate({ ...template, fields: newFields });
  };

  // Add a new field
  const handleAddField = () => {
    const idx = template.fields.length + 1;
    const newField: ArtField = {
      id: 'field-' + Date.now(),
      label: `Novo Campo ${idx}`,
      type: 'text',
      value: `Texto Editável ${idx}`,
      x: Math.round(template.width * 0.15),
      y: Math.round(template.height * 0.25),
      width: Math.round(template.width * 0.7),
      fontFamily: 'Montserrat',
      fontSize: Math.max(18, Math.round(template.width * 0.032)),
      fontWeight: '700',
      color: '#1e293b',
      align: 'left',
      lineHeight: 1.25,
      uppercase: false,
      bgEnabled: true,
      bgColor: '#facc15',
      bgPadding: 8,
      bgRadius: 8
    };
    onUpdateTemplate({ ...template, fields: [...template.fields, newField] });
    setSelectedFieldId(newField.id);
    showToast(`Campo "${newField.label}" adicionado! Arraste-o sobre a arte.`);
  };

  // Duplicate current field
  const handleDuplicateField = () => {
    if (!selectedField) return;
    const copy: ArtField = {
      ...selectedField,
      id: 'field-' + Date.now(),
      label: selectedField.label + ' (Cópia)',
      y: Math.min(template.height - 40, selectedField.y + 45)
    };
    onUpdateTemplate({ ...template, fields: [...template.fields, copy] });
    setSelectedFieldId(copy.id);
    showToast(`Campo duplicado como "${copy.label}".`);
  };

  // Delete current field
  const handleDeleteField = () => {
    if (!selectedFieldId) return;
    const newFields = template.fields.filter((f) => f.id !== selectedFieldId);
    onUpdateTemplate({ ...template, fields: newFields });
    setSelectedFieldId(newFields[0]?.id || '');
    showToast('Campo excluído do modelo.');
  };

  // Handle Background Upload for existing model
  const handleBackgroundUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Por favor, envie um arquivo de imagem válido (PNG, JPG ou WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        bgImageCache.current[template.id] = img;
        onUpdateTemplate({
          ...template,
          width: w,
          height: h,
          backgroundDataUrl: dataUrl
        });
        showToast(`Imagem de fundo atualizada (${w} × ${h} px)!`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Canvas Mouse / Touch Helpers
  const getCanvasLogicalCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleCanvasMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getCanvasLogicalCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Eyedropper mode
    if (eyedropperMode && selectedField) {
      renderCanvas(true);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const px = Math.max(0, Math.min(canvas.width - 1, Math.round(coords.x)));
        const py = Math.max(0, Math.min(canvas.height - 1, Math.round(coords.y)));
        const pixel = ctx.getImageData(px, py, 1, 1).data;
        const hex =
          '#' +
          [pixel[0], pixel[1], pixel[2]]
            .map((v) => v.toString(16).padStart(2, '0'))
            .join('');

        if (eyedropperMode === 'text') {
          updateField(selectedField.id, { color: hex });
        } else {
          updateField(selectedField.id, { bgEnabled: true, bgColor: hex });
        }
        showToast(`Cor ${hex.toUpperCase()} capturada da arte!`);
      }
      setEyedropperMode(null);
      renderCanvas(false);
      return;
    }

    // 2. Resize handle of selected field
    const selBox = fieldHitBoxes.current[selectedFieldId];
    if (selBox && selectedField) {
      const dist = Math.hypot(coords.x - (selBox.handleX + 4), coords.y - selBox.handleY);
      if (dist <= 16) {
        pointerState.current = {
          type: 'resize',
          fieldId: selectedField.id,
          startX: coords.x,
          startY: coords.y,
          origX: selectedField.x,
          origY: selectedField.y,
          origWidth: selectedField.width
        };
        return;
      }
    }

    // 3. Click field to drag & select
    for (let i = template.fields.length - 1; i >= 0; i--) {
      const f = template.fields[i];
      const box = fieldHitBoxes.current[f.id];
      if (box && isPointInBox(coords.x, coords.y, box, 6)) {
        setSelectedFieldId(f.id);
        pointerState.current = {
          type: 'drag',
          fieldId: f.id,
          startX: coords.x,
          startY: coords.y,
          origX: f.x,
          origY: f.y,
          origWidth: f.width
        };
        return;
      }
    }
  };

  const handleCanvasMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getCanvasLogicalCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!pointerState.current.type) {
      if (eyedropperMode) {
        canvas.style.cursor = 'crosshair';
        return;
      }
      const selBox = fieldHitBoxes.current[selectedFieldId];
      if (selBox && Math.hypot(coords.x - (selBox.handleX + 4), coords.y - selBox.handleY) <= 16) {
        canvas.style.cursor = 'ew-resize';
        return;
      }
      let hovering = false;
      for (let i = template.fields.length - 1; i >= 0; i--) {
        const box = fieldHitBoxes.current[template.fields[i].id];
        if (box && isPointInBox(coords.x, coords.y, box, 6)) {
          hovering = true;
          break;
        }
      }
      canvas.style.cursor = hovering ? 'move' : 'default';
      return;
    }

    const activeField = template.fields.find((f) => f.id === pointerState.current.fieldId);
    if (!activeField) return;

    const dx = coords.x - pointerState.current.startX;
    const dy = coords.y - pointerState.current.startY;

    if (pointerState.current.type === 'drag') {
      const newX = Math.round(
        Math.max(0, Math.min(template.width - 20, pointerState.current.origX + dx))
      );
      const newY = Math.round(
        Math.max(0, Math.min(template.height - 20, pointerState.current.origY + dy))
      );
      updateField(activeField.id, { x: newX, y: newY });
    } else if (pointerState.current.type === 'resize') {
      const newW = Math.round(
        Math.max(40, Math.min(template.width - activeField.x, pointerState.current.origWidth + dx))
      );
      updateField(activeField.id, { width: newW });
    }
  };

  const handleCanvasMouseUp = () => {
    pointerState.current.type = null;
  };

  // Paste image with Ctrl+V
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleBackgroundUpload(file);
            e.preventDefault();
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [template]);

  return (
    <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputBgRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleBackgroundUpload(file);
          e.target.value = '';
        }}
      />
      <input
        ref={fileInputNewWithImgRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onCreateNewWithImage(file);
          e.target.value = '';
        }}
      />
      <input
        ref={fileInputJsonRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportTemplateJson(file);
          e.target.value = '';
        }}
      />

      {/* =================================================================== */}
      {/* COLUNA ESQUERDA (5 COLUNAS): FORMULÁRIO OU CONFIGURAÇÃO             */}
      {/* =================================================================== */}
      <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col lg:max-h-[calc(100vh-88px)] overflow-hidden">
        {/* Barra Superior: Seletor de Modelo + Novo com Imagem */}
        <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                Modelo:
              </span>
              <select
                aria-label="Selecionar modelo de comunicado"
                value={template.id}
                onChange={(e) => onSelectTemplate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 truncate cursor-pointer"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.category})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => fileInputNewWithImgRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer"
              title="Cadastrar um novo modelo enviando uma imagem base do computador"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo c/ Imagem</span>
            </button>
          </div>

          {/* Abas Internas da Etapa 1 */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSubTab('fill')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                subTab === 'fill'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>1. Preencher Formulário</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('configure')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                subTab === 'configure'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>2. Configurar Modelo e Fundo</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SUB-ABA 1: PREENCHIMENTO RÁPIDO NO DIA A DIA                     */}
        {/* ================================================================= */}
        {subTab === 'fill' && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Card de Fundo da Arte */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={template.backgroundDataUrl}
                  alt={template.name}
                  className="w-11 h-14 object-cover rounded-lg border border-slate-700 bg-slate-900 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                    Imagem de Fundo da Arte
                  </span>
                  <p className="text-xs text-slate-300 truncate">
                    Resolução: {template.width} × {template.height} px
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Você pode arrastar uma imagem para o palco ou dar Ctrl+V
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputBgRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition shrink-0 cursor-pointer"
              >
                Trocar Fundo
              </button>
            </div>

            {/* Cabeçalho do Formulário */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <h2 className="text-sm font-bold text-white">{template.name}</h2>
                <p className="text-xs text-slate-400">
                  {template.category} • {template.fields.length} campos editáveis
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubTab('configure')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                + Editar / Criar Campos
              </button>
            </div>

            {/* Lista de Inputs Gerados Automaticamente */}
            <div className="space-y-3">
              {template.fields.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-400">
                  Nenhum campo adicionado neste modelo ainda. Mude para a aba{' '}
                  <strong className="text-amber-400">"2. Configurar Modelo e Fundo"</strong> e adicione
                  um campo.
                </div>
              ) : (
                template.fields.map((field, idx) => {
                  const isSelected = field.id === selectedFieldId;
                  return (
                    <div
                      key={field.id}
                      className={`p-3 rounded-xl border transition ${
                        isSelected
                          ? 'bg-slate-950 border-emerald-500/60 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor={`input-${field.id}`}
                          className="text-xs font-bold text-slate-200 cursor-pointer"
                        >
                          {idx + 1}. {field.label}
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">
                          ({field.x}, {field.y})
                        </span>
                      </div>

                      {field.type === 'textarea' ? (
                        <textarea
                          id={`input-${field.id}`}
                          rows={3}
                          value={field.value}
                          onFocus={() => setSelectedFieldId(field.id)}
                          onChange={(e) => updateField(field.id, { value: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <input
                          id={`input-${field.id}`}
                          type="text"
                          value={field.value}
                          onFocus={() => setSelectedFieldId(field.id)}
                          onChange={(e) => updateField(field.id, { value: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SUB-ABA 2: CONFIGURAÇÃO DO MODELO, FUNDO E PROPRIEDADES           */}
        {/* ================================================================= */}
        {subTab === 'configure' && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Bloco A: Informações do Modelo e Upload de Fundo */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  A. Imagem Base e Dados do Modelo
                </h3>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {template.width} × {template.height} px
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="cfg-model-name" className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Nome do Modelo
                  </label>
                  <input
                    id="cfg-model-name"
                    type="text"
                    value={template.name}
                    onChange={(e) => onUpdateTemplate({ ...template, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="cfg-model-cat" className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Categoria (Etapa 2)
                  </label>
                  <select
                    id="cfg-model-cat"
                    value={template.category}
                    onChange={(e) => onUpdateTemplate({ ...template, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Informativos diversos">Informativos diversos</option>
                    <option value="Comunicados internos">Comunicados internos</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Avisos operacionais">Avisos operacionais</option>
                    <option value="Datas comemorativas">Datas comemorativas</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                <img
                  src={template.backgroundDataUrl}
                  alt={template.name}
                  className="w-12 h-16 object-cover rounded-lg border border-slate-700 bg-slate-950 shrink-0"
                />
                <div className="flex-1 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputBgRef.current?.click()}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Escolher Imagem de Fundo (PNG / JPG)</span>
                  </button>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    O tamanho da tela se ajustará automaticamente à proporção da imagem.
                  </p>
                </div>
              </div>
            </div>

            {/* Bloco B: Chips de Campos */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  B. Campos Posicionados na Arte
                </h3>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Campo</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Selecione um campo para configurar suas propriedades ou arraste-o diretamente sobre a imagem:
              </p>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                {template.fields.map((field, idx) => {
                  const isSel = field.id === selectedFieldId;
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => setSelectedFieldId(field.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        isSel
                          ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {idx + 1}. {field.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bloco C: Inspetor de Propriedades do Campo Selecionado */}
            {selectedField && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    C. Propriedades do Campo
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleDuplicateField}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Duplicar</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteField}
                      className="px-2 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-[11px] text-rose-300 border border-rose-800/50 font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-7">
                    <label htmlFor="insp-label-input" className="block text-[11px] text-slate-400 mb-1">
                      Nome da Pergunta no Formulário
                    </label>
                    <input
                      id="insp-label-input"
                      type="text"
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label htmlFor="insp-type-select" className="block text-[11px] text-slate-400 mb-1">
                      Tipo de Entrada
                    </label>
                    <select
                      id="insp-type-select"
                      value={selectedField.type}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          type: e.target.value as 'text' | 'textarea'
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="text">Texto Curto (1 linha)</option>
                      <option value="textarea">Texto Longo (Múltiplas linhas)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="insp-value-textarea" className="block text-[11px] text-slate-400 mb-1">
                    Valor Atual / Texto de Exemplo
                  </label>
                  <textarea
                    id="insp-value-textarea"
                    rows={2}
                    value={selectedField.value}
                    onChange={(e) => updateField(selectedField.id, { value: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Fonte, Tamanho e Peso */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="insp-font-family" className="block text-[11px] text-slate-400 mb-1">
                      Fonte
                    </label>
                    <select
                      id="insp-font-family"
                      value={selectedField.fontFamily}
                      onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Ubuntu">Ubuntu</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Carlito">Carlito / Calibri</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Inter">Inter</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="insp-font-size" className="block text-[11px] text-slate-400 mb-1">
                      Tamanho (px)
                    </label>
                    <input
                      id="insp-font-size"
                      type="number"
                      min={8}
                      max={160}
                      value={selectedField.fontSize}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          fontSize: Math.max(8, Number(e.target.value) || 16)
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="insp-font-weight" className="block text-[11px] text-slate-400 mb-1">
                      Peso
                    </label>
                    <select
                      id="insp-font-weight"
                      value={selectedField.fontWeight}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          fontWeight: e.target.value as ArtField['fontWeight']
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="400">Normal (400)</option>
                      <option value="500">Médio (500)</option>
                      <option value="600">Semibold (600)</option>
                      <option value="700">Negrito (700)</option>
                      <option value="800">ExtraBold (800)</option>
                    </select>
                  </div>
                </div>

                {/* Cor do Texto, Alinhamento e Maiúsculas */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  <div className="sm:col-span-5">
                    <label htmlFor="insp-color-hex" className="block text-[11px] text-slate-400 mb-1">
                      Cor do Texto
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                      <input
                        type="color"
                        aria-label="Selecionar cor do texto"
                        value={selectedField.color}
                        onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <input
                        id="insp-color-hex"
                        type="text"
                        value={selectedField.color}
                        onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                        className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEyedropperMode('text');
                          showToast('Clique sobre qualquer ponto da arte para capturar a cor do texto.');
                        }}
                        className={`px-1.5 py-1 rounded text-[10px] font-bold shrink-0 transition cursor-pointer flex items-center gap-0.5 ${
                          eyedropperMode === 'text'
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                        }`}
                        title="Capturar cor clicando na arte"
                      >
                        <Pipette className="w-3 h-3" />
                        <span>Gotas</span>
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <span className="block text-[11px] text-slate-400 mb-1">Alinhamento</span>
                    <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                      {(['left', 'center', 'right', 'justify'] as const).map((al) => (
                        <button
                          key={al}
                          type="button"
                          aria-label={`Alinhamento ${al}`}
                          onClick={() => updateField(selectedField.id, { align: al })}
                          className={`py-1 rounded text-[10px] font-bold flex items-center justify-center transition cursor-pointer ${
                            selectedField.align === al
                              ? 'bg-emerald-500 text-slate-950'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {al === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                          {al === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                          {al === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                          {al === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-3 pb-1">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedField.uppercase}
                        onChange={(e) => updateField(selectedField.id, { uppercase: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                      <span>MAIÚSCULAS</span>
                    </label>
                  </div>
                </div>

                {/* Tarja de Fundo Atrás do Texto (Para cobrir texto antigo) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedField.bgEnabled}
                      onChange={(e) => updateField(selectedField.id, { bgEnabled: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                    />
                    <span>Pintar tarja/fundo atrás do texto (Cobrir texto da imagem original)</span>
                  </label>

                  {selectedField.bgEnabled && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div>
                        <span className="block text-[10px] text-slate-400 mb-0.5">Cor do Fundo</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            aria-label="Cor do fundo do texto"
                            value={selectedField.bgColor}
                            onChange={(e) =>
                              updateField(selectedField.id, { bgColor: e.target.value })
                            }
                            className="w-7 h-7 rounded cursor-pointer bg-slate-950 border border-slate-700 p-0.5 shrink-0"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEyedropperMode('bg');
                              showToast('Clique sobre a arte para capturar a cor de fundo.');
                            }}
                            className={`w-full py-1 px-1.5 rounded text-[10px] font-bold truncate transition cursor-pointer ${
                              eyedropperMode === 'bg'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                            }`}
                          >
                            Pegar da Arte
                          </button>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="insp-bg-padding" className="block text-[10px] text-slate-400 mb-0.5">
                          Margem (px)
                        </label>
                        <input
                          id="insp-bg-padding"
                          type="number"
                          min={0}
                          max={60}
                          value={selectedField.bgPadding}
                          onChange={(e) =>
                            updateField(selectedField.id, {
                              bgPadding: Number(e.target.value) || 0
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="insp-bg-radius" className="block text-[10px] text-slate-400 mb-0.5">
                          Borda Arred.
                        </label>
                        <input
                          id="insp-bg-radius"
                          type="number"
                          min={0}
                          max={60}
                          value={selectedField.bgRadius}
                          onChange={(e) =>
                            updateField(selectedField.id, {
                              bgRadius: Number(e.target.value) || 0
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Coordenadas e Dimensões */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="insp-x-coord" className="block text-[10px] text-slate-400 mb-0.5">
                      Posição X
                    </label>
                    <input
                      id="insp-x-coord"
                      type="number"
                      value={selectedField.x}
                      onChange={(e) =>
                        updateField(selectedField.id, { x: Number(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="insp-y-coord" className="block text-[10px] text-slate-400 mb-0.5">
                      Posição Y
                    </label>
                    <input
                      id="insp-y-coord"
                      type="number"
                      value={selectedField.y}
                      onChange={(e) =>
                        updateField(selectedField.id, { y: Number(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="insp-w-dim" className="block text-[10px] text-slate-400 mb-0.5">
                      Largura (px)
                    </label>
                    <input
                      id="insp-w-dim"
                      type="number"
                      min={30}
                      value={selectedField.width}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          width: Math.max(30, Number(e.target.value) || 100)
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="insp-lh-dim" className="block text-[10px] text-slate-400 mb-0.5">
                      Entrelinha
                    </label>
                    <input
                      id="insp-lh-dim"
                      type="number"
                      step="0.05"
                      min="0.8"
                      max="2.5"
                      value={selectedField.lineHeight}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          lineHeight: Number(e.target.value) || 1.25
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Barra de Ações Fixa Inferior: Exportar PNG / JPG / JSON */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (canvasRef.current) {
                  onExportArt('png', canvasRef.current);
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PNG</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (canvasRef.current) {
                  onExportArt('jpg', canvasRef.current);
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar JPG</span>
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => onDownloadTemplateJson(template)}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span>Baixar Modelo (.JSON)</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputJsonRef.current?.click()}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Importar (.JSON)</span>
            </button>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* COLUNA DIREITA (7 COLUNAS): CANVAS INTERATIVO                       */}
      {/* =================================================================== */}
      <section className="lg:col-span-7 flex flex-col items-center">
        {/* Barra de Ferramentas Acima do Canvas */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-t-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                eyedropperMode ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            ></span>
            <span className="font-medium text-slate-300">
              {eyedropperMode
                ? 'Modo Conta-gotas: clique em qualquer ponto da arte para capturar a cor!'
                : 'Arraste qualquer texto sobre a imagem ou digite no formulário ao lado.'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => fileInputBgRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Imagem de Fundo</span>
            </button>

            <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-emerald-500"
              />
              <span>Demarcação dos campos</span>
            </label>
          </div>
        </div>

        {/* Palco do Canvas com Drag & Drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDragOver(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer?.files?.[0];
            if (file) handleBackgroundUpload(file);
          }}
          className="w-full stage-checkerboard border-x border-b border-slate-800 rounded-b-2xl p-4 sm:p-6 flex items-center justify-center min-h-[560px] relative overflow-auto"
        >
          {isDragOver && (
            <div className="absolute inset-4 rounded-2xl bg-emerald-950/90 border-2 border-dashed border-emerald-400 z-20 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
              <p className="text-base font-extrabold text-white">
                Solte a imagem (PNG, JPG ou WebP) aqui para atualizar o fundo da arte!
              </p>
              <p className="text-xs text-emerald-300 mt-1">
                A resolução do canvas se adaptará automaticamente.
              </p>
            </div>
          )}

          <canvas
            id="art-canvas"
            ref={canvasRef}
            width={template.width}
            height={template.height}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onTouchStart={handleCanvasMouseDown}
            onTouchMove={handleCanvasMouseMove}
            onTouchEnd={handleCanvasMouseUp}
          />
        </div>
      </section>
    </div>
  );
};
