import React from 'react';
import { Lock, FileSpreadsheet, ShieldCheck, MapPin } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  isAdminUnlocked: boolean;
  activeView: 'survey' | 'admin';
  onSwitchView: (view: 'survey' | 'admin') => void;
  totalResponses: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  isAdminUnlocked,
  activeView,
  onSwitchView,
  totalResponses
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-emerald-800/40 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand / Context */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 p-0.5 shadow-md flex items-center justify-center ring-2 ring-emerald-500/30">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ley 594 de 2000
              </span>
              <span className="text-[11px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Valle del Cauca
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-snug">
              Diagnóstico de Cumplimiento Normativo Archivístico (AGN)
            </h1>
          </div>
        </div>

        {/* Navigation & Admin Action */}
        <div className="flex items-center gap-2.5 self-end md:self-center">
          {isAdminUnlocked && (
            <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
              <button
                onClick={() => onSwitchView('survey')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeView === 'survey'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Formulario
              </button>
              <button
                onClick={() => onSwitchView('admin')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeView === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Resultados ({totalResponses})
              </button>
            </div>
          )}

          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              isAdminUnlocked
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 ring-2 ring-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-amber-500/10'
            }`}
            title="Acceso protegido con contraseña"
          >
            {isAdminUnlocked ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Panel de Respuestas</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-900" />
                <span>Ver respuestas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
