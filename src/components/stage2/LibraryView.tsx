import React, { useState, useRef } from 'react';
import { ArtTemplate } from '../../types';
import { Plus, Upload, Copy, Download, Trash2, Edit3, Settings } from 'lucide-react';

interface LibraryViewProps {
  templates: ArtTemplate[];
  onSelectTemplate: (templateId: string, subTab?: 'fill' | 'configure') => void;
  onDuplicateTemplate: (template: ArtTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onDownloadTemplateJson: (template: ArtTemplate) => void;
  onImportTemplateJson: (file: File) => void;
  onCreateNewWithImage: (file: File) => void;
}

const CATEGORIES = [
  'Todos',
  'Informativos diversos',
  'Comunicados internos',
  'Eventos',
  'Avisos operacionais',
  'Datas comemorativas'
];

export const LibraryView: React.FC<LibraryViewProps> = ({
  templates,
  onSelectTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  onDownloadTemplateJson,
  onImportTemplateJson,
  onCreateNewWithImage
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const fileImgRef = useRef<HTMLInputElement | null>(null);
  const fileJsonRef = useRef<HTMLInputElement | null>(null);

  const filteredTemplates =
    selectedCategory === 'Todos'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  return (
    <section className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6 space-y-6">
      <input
        ref={fileImgRef}
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
        ref={fileJsonRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportTemplateJson(file);
          e.target.value = '';
        }}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            Início • Etapa 2
          </span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            Biblioteca de Modelos Padronizados
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize seus modelos por categoria, crie cópias para preservar o original ou cadastre
            novas artes enviando uma imagem base.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fileImgRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Modelo com Imagem</span>
          </button>
          <button
            type="button"
            onClick={() => fileJsonRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Importar Modelo (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg hover:border-emerald-500/40 transition"
          >
            <div>
              <div className="h-52 bg-slate-950 flex items-center justify-center p-3 border-b border-slate-800 relative">
                <img
                  src={tpl.backgroundDataUrl}
                  alt={tpl.name}
                  className="max-h-full max-w-full object-contain rounded shadow"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/90 text-emerald-400 border border-emerald-500/30">
                  {tpl.category}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/90 text-slate-300 border border-slate-700">
                  {tpl.width} × {tpl.height} px
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-extrabold text-white">{tpl.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {tpl.fields.length} campos dinâmicos vinculados ao formulário
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTemplate(tpl.id, 'fill')}
                  className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Preencher Arte</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTemplate(tpl.id, 'configure')}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Configurar</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onDuplicateTemplate(tpl)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>Criar Cópia</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDownloadTemplateJson(tpl)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-slate-400" />
                  <span>.JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTemplate(tpl.id)}
                  className="py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[11px] font-semibold border border-rose-800/40 transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Excluir modelo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
