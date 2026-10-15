import React from 'react';
import { StageKey } from '../types';
import { Sparkles, Layers, History, Inbox, Zap } from 'lucide-react';

interface HeaderProps {
  activeStage: StageKey;
  onSelectStage: (stage: StageKey) => void;
  templatesCount: number;
  historyCount: number;
  pendingRequestsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeStage,
  onSelectStage,
  templatesCount,
  historyCount,
  pendingRequestsCount
}) => {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Identidade do Sistema */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-900/40 shrink-0 tracking-tight">
            SA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Studio de Automação de Artes e Comunicados
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                MVP & Upgrades
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cadastre o modelo uma única vez e gere novas artes preenchendo apenas o formulário
            </p>
          </div>
        </div>

        {/* Navegação por Etapas (Início vs Upgrades) */}
        <nav aria-label="Navegação de Etapas" className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          {/* Grupo INÍCIO */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 px-2 py-1">
              Início
            </span>
            <button
              type="button"
              onClick={() => onSelectStage('stage-1')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeStage === 'stage-1'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Etapa 1: MVP Estúdio</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectStage('stage-2')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeStage === 'stage-2'
                  ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Etapa 2: Biblioteca</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-emerald-400 font-bold border border-emerald-500/20">
                {templatesCount}
              </span>
            </button>
          </div>

          {/* Grupo UPGRADES */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 px-2 py-1">
              Upgrades
            </span>
            <button
              type="button"
              onClick={() => onSelectStage('stage-3')}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeStage === 'stage-3'
                  ? 'bg-amber-400 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Etapa 3: Histórico</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-amber-400 font-bold">
                {historyCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSelectStage('stage-4')}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeStage === 'stage-4'
                  ? 'bg-amber-400 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Etapa 4: Solicitações</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/25 text-amber-300 font-bold border border-amber-500/30">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onSelectStage('stage-5')}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeStage === 'stage-5'
                  ? 'bg-amber-400 text-slate-950 shadow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Etapa 5: Automações</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
