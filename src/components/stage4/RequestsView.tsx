import React, { useState } from 'react';
import { ArtTemplate, SectorRequest } from '../../types';
import { Send, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface RequestsViewProps {
  requests: SectorRequest[];
  templates: ArtTemplate[];
  onLoadRequestIntoStudio: (req: SectorRequest) => void;
  onSubmitNewRequest: (req: Omit<SectorRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  templates,
  onLoadRequestIntoStudio,
  onSubmitNewRequest
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [department, setDepartment] = useState<string>('Segurança da Informação (TI)');
  const [requester, setRequester] = useState<string>('Carlos Eduardo');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const activeTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleFieldChange = (fieldId: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;

    // Default to field's existing value if not overridden in form
    const finalValues: Record<string, string> = {};
    activeTemplate.fields.forEach((f) => {
      finalValues[f.id] = fieldValues[f.id] !== undefined ? fieldValues[f.id] : f.value;
    });

    onSubmitNewRequest({
      department: department.trim() || 'Setor Interno',
      requester: requester.trim() || 'Colaborador',
      templateId: activeTemplate.id,
      templateName: activeTemplate.name,
      fieldValues: finalValues
    });

    // Reset input fields
    setFieldValues({});
  };

  return (
    <section className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Coluna Esquerda: Fila de Solicitações Recebidas */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
            Upgrades • Etapa 4
          </span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            Fila de Solicitações dos Setores
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Outros setores enviam apenas as informações. Com 1 clique em{' '}
            <strong className="text-emerald-400">"Carregar no Estúdio"</strong>, os dados preenchem o
            modelo automaticamente para você revisar e exportar.
          </p>
        </div>

        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
              Nenhuma solicitação na fila no momento. Utilize o formulário ao lado para simular o
              envio de um setor.
            </div>
          ) : (
            requests.map((req) => {
              const isDone = req.status === 'Concluído';
              return (
                <div
                  key={req.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isDone ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Concluído</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pendente de Revisão</span>
                        </span>
                      )}
                      <span className="text-xs font-bold text-emerald-400">{req.department}</span>
                      <span className="text-xs text-slate-500">
                        • Solicitado por {req.requester} em {req.createdAt}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white">{req.templateName}</h4>
                    <p className="text-xs text-slate-400">
                      Clique ao lado para preencher o modelo com os dados enviados e abrir no Estúdio.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onLoadRequestIntoStudio(req)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Carregar no Estúdio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Coluna Direita: Simulador de Formulário para Outros Setores */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Portal do Solicitante (Simulador Interno)
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            Registrar Nova Solicitação de Setor
          </h3>
          <p className="text-xs text-slate-400">
            Simule como um colaborador de outro setor (RH, TI, Manutenção, SSMA) solicita um
            comunicado sem precisar abrir editor visual.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="req-dept-input" className="block text-xs font-semibold text-slate-300 mb-1">
                Setor Solicitante
              </label>
              <input
                id="req-dept-input"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="req-name-input" className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Solicitante
              </label>
              <input
                id="req-name-input"
                type="text"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="req-tpl-select" className="block text-xs font-semibold text-slate-300 mb-1">
              Modelo de Comunicado Desejado
            </label>
            <select
              id="req-tpl-select"
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                setFieldValues({});
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.category})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic questions for requester */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {activeTemplate?.fields.map((f) => {
              const currentVal =
                fieldValues[f.id] !== undefined ? fieldValues[f.id] : f.value;
              return (
                <div key={f.id}>
                  <label htmlFor={`req-field-${f.id}`} className="block text-[11px] font-semibold text-slate-400 mb-0.5">
                    {f.label}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea
                      id={`req-field-${f.id}`}
                      rows={2}
                      value={currentVal}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <input
                      id={`req-field-${f.id}`}
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Solicitação para a Fila de Produção</span>
          </button>
        </form>
      </div>
    </section>
  );
};
