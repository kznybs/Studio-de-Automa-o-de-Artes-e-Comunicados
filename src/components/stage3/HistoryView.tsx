import React from 'react';
import { HistoryRecord } from '../../types';
import { Download, Trash2, RotateCcw } from 'lucide-react';

interface HistoryViewProps {
  records: HistoryRecord[];
  onReopenRecord: (record: HistoryRecord) => void;
  onExportCsv: () => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onReopenRecord,
  onExportCsv,
  onClearHistory
}) => {
  return (
    <section className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
            Upgrades • Etapa 3
          </span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            Histórico e Registro de Comunicados Gerados
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cada exportação registra automaticamente a data, o modelo utilizado e todos os dados
            preenchidos para auditoria no Excel ou Microsoft Lists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={records.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Histórico Completo (.CSV / Excel)</span>
          </button>
          <button
            type="button"
            onClick={onClearHistory}
            disabled={records.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
            <span>Limpar Histórico</span>
          </button>
        </div>
      </div>

      {/* Tabela de Histórico */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Data / Hora</th>
                <th className="py-3.5 px-4">Modelo Utilizado</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Formato</th>
                <th className="py-3.5 px-4">Dados Preenchidos no Comunicado</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Nenhuma arte exportada ainda nesta sessão. Exporte uma arte na{' '}
                    <strong className="text-emerald-400">Etapa 1</strong> para gerar o registro
                    automaticamente.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {rec.timestamp}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{rec.templateName}</td>
                    <td className="py-3 px-4 text-slate-400">{rec.category}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold text-[10px]">
                        {rec.format}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xl">
                        {Object.entries(rec.values)
                          .slice(0, 4)
                          .map(([k, v]) => (
                            <span
                              key={k}
                              className="inline-block bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[11px]"
                            >
                              <strong className="text-emerald-400">{k}:</strong>{' '}
                              {String(v).slice(0, 36)}
                            </span>
                          ))}
                        {Object.keys(rec.values).length > 4 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{Object.keys(rec.values).length - 4} campos
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onReopenRecord(rec)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 transition flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reabrir no Estúdio</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
