import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  MapPin,
  UserCheck,
  Send,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Coins,
  UserX,
  Briefcase,
  Cpu,
  Warehouse,
  GitPullRequestDraft
} from 'lucide-react';
import { CAUSES_LIST, MUNICIPALITIES_VALLE, ENTITY_TYPES, ROLES_LIST } from '../data/causes';
import { CauseOption, SurveyResponse } from '../types';

interface SurveyFormProps {
  onSubmitSuccess: (response: Omit<SurveyResponse, 'id' | 'timestamp'>) => void;
  onOpenAdmin: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmitSuccess, onOpenAdmin }) => {
  // Demographic form state
  const [municipality, setMunicipality] = useState(MUNICIPALITIES_VALLE[0]);
  const [entityType, setEntityType] = useState(ENTITY_TYPES[0]);
  const [entityName, setEntityName] = useState('');
  const [respondentRole, setRespondentRole] = useState(ROLES_LIST[0]);
  const [observations, setObservations] = useState('');

  // 3 ranked cause questions (Mutual Exclusion)
  const [cause1, setCause1] = useState<string>(''); // Causa Principal
  const [cause2, setCause2] = useState<string>(''); // Segunda Causa
  const [cause3, setCause3] = useState<string>(''); // Tercera Causa

  // Validation & UI states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState<any | null>(null);

  // Helper to render cause category icon
  const getCauseIcon = (id: string) => {
    switch (id) {
      case 'presupuesto_insuficiente':
        return <Coins className="w-5 h-5 text-amber-600" />;
      case 'talento_humano_calificado':
        return <UserX className="w-5 h-5 text-rose-600" />;
      case 'cultura_directiva':
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      case 'instrumentos_archivisticos':
        return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
      case 'tecnologia_sgdea':
        return <Cpu className="w-5 h-5 text-cyan-600" />;
      case 'control_auditoria_debil':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'espacios_infraestructura':
        return <Warehouse className="w-5 h-5 text-orange-600" />;
      case 'resistencia_cambio':
        return <GitPullRequestDraft className="w-5 h-5 text-indigo-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const isOptionDisabled = (causeId: string, currentQuestionIndex: 1 | 2 | 3): { disabled: boolean; reason?: string } => {
    if (currentQuestionIndex === 1) {
      if (cause2 === causeId) return { disabled: true, reason: 'Seleccionada como 2ª Causa' };
      if (cause3 === causeId) return { disabled: true, reason: 'Seleccionada como 3ª Causa' };
    } else if (currentQuestionIndex === 2) {
      if (cause1 === causeId) return { disabled: true, reason: 'Seleccionada como Causa Principal' };
      if (cause3 === causeId) return { disabled: true, reason: 'Seleccionada como 3ª Causa' };
    } else if (currentQuestionIndex === 3) {
      if (cause1 === causeId) return { disabled: true, reason: 'Seleccionada como Causa Principal' };
      if (cause2 === causeId) return { disabled: true, reason: 'Seleccionada como 2ª Causa' };
    }
    return { disabled: false };
  };

  const getCauseById = (id: string): CauseOption | undefined => {
    return CAUSES_LIST.find((c) => c.id === id);
  };

  const handleResetForm = () => {
    setCause1('');
    setCause2('');
    setCause3('');
    setEntityName('');
    setObservations('');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!cause1) {
      setErrorMsg('Debe seleccionar la Causa Principal (Pregunta 1).');
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }
    if (!cause2) {
      setErrorMsg('Debe seleccionar la Segunda Causa Determinante (Pregunta 2).');
      window.scrollTo({ top: 750, behavior: 'smooth' });
      return;
    }
    if (!cause3) {
      setErrorMsg('Debe seleccionar la Tercera Causa Complementaria (Pregunta 3).');
      window.scrollTo({ top: 1150, behavior: 'smooth' });
      return;
    }

    // Verify uniqueness
    if (cause1 === cause2 || cause1 === cause3 || cause2 === cause3) {
      setErrorMsg('Las tres causas seleccionadas deben ser distintas entre sí.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      municipality,
      entityType,
      entityName: entityName.trim() || undefined,
      respondentRole,
      cause1,
      cause2,
      cause3,
      observations: observations.trim() || undefined
    };

    setTimeout(() => {
      onSubmitSuccess(payload);
      setSubmittedResponse(payload);
      setIsSubmitting(false);
      handleResetForm();
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 pt-6 px-4 sm:px-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/50 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Info className="w-3.5 h-3.5" /> Instrumento de Diagnóstico Departamental
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3">
            ¿Por qué algunas empresas públicas o privadas de funciones públicas del Valle del Cauca no aplican correctamente o en su totalidad los lineamientos del Archivo General de la Nación en la Ley 594 de 2000?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Este instrumento tiene como objetivo identificar y jerarquizar las principales causas del rezago archivístico en el departamento del Valle del Cauca. Por favor, califique en orden de impacto las <strong>3 causas principales</strong> (las opciones son idénticas en las 3 preguntas, pero no podrá repetir la misma causa en más de una pregunta).
          </p>

          {/* Quick tracker pills */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
            <span className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
              cause1
                ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">1</span>
              Causa Principal: {cause1 ? getCauseById(cause1)?.shortTitle : 'Pendiente'}
            </span>
            <span className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
              cause2
                ? 'bg-teal-900/60 border-teal-500/40 text-teal-200'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-teal-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">2</span>
              2ª Causa: {cause2 ? getCauseById(cause2)?.shortTitle : 'Pendiente'}
            </span>
            <span className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
              cause3
                ? 'bg-amber-900/60 border-amber-500/40 text-amber-200'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">3</span>
              3ª Causa: {cause3 ? getCauseById(cause3)?.shortTitle : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 text-red-700 shadow-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-sm">
            <strong className="font-semibold block mb-0.5">Atención requerida:</strong>
            {errorMsg}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Demographics */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                1. Contexto de la Entidad y el Encuestado
              </h3>
              <p className="text-xs text-slate-500">
                Información para la caracterización institucional en el Valle del Cauca.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Municipality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Municipio del Valle del Cauca <span className="text-emerald-600">*</span>
              </label>
              <div className="relative">
                <select
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all"
                >
                  {MUNICIPALITIES_VALLE.map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Entity Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tipo de Entidad <span className="text-emerald-600">*</span>
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all"
              >
                {ENTITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Name (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombre de la Entidad <span className="text-slate-400 font-normal">(Opcional / Confidencial)</span>
              </label>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Ej. Alcaldía de Tuluá, Notaría 2, Hospital Departamental"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all"
              />
            </div>

            {/* Respondent Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cargo o Rol del Encuestado <span className="text-emerald-600">*</span>
              </label>
              <select
                value={respondentRole}
                onChange={(e) => setRespondentRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all"
              >
                {ROLES_LIST.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================
            PREGUNTA 1: CAUSA PRINCIPAL (1° IMPACTO)
           ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border-2 border-emerald-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-emerald-600/30">
                1
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Pregunta 1 de 3 • Mayor Impacto
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  ¿Cuál considera que es la <span className="text-emerald-700 font-extrabold underline decoration-emerald-400">CAUSA PRINCIPAL</span> por la cual no se aplican los lineamientos del AGN (Ley 594 de 2000)?
                </h3>
              </div>
            </div>
            {cause1 && (
              <button
                type="button"
                onClick={() => setCause1('')}
                className="text-xs text-slate-400 hover:text-red-600 self-start sm:self-center font-medium transition-colors"
              >
                Deseleccionar
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Seleccione la causa número uno más crítica y determinante en su experiencia institucional:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CAUSES_LIST.map((cause) => {
              const { disabled, reason } = isOptionDisabled(cause.id, 1);
              const isSelected = cause1 === cause.id;

              return (
                <div
                  key={cause.id}
                  onClick={() => {
                    if (!disabled) {
                      setCause1(cause.id);
                      if (errorMsg) setErrorMsg(null);
                    }
                  }}
                  className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm'
                      : disabled
                      ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : disabled
                            ? 'border-slate-300 bg-slate-100'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {cause.code}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cause.badgeColor}`}>
                          {cause.category}
                        </span>
                        {disabled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            {reason}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                        {cause.shortTitle}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {cause.fullDescription}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            PREGUNTA 2: SEGUNDA CAUSA (2° IMPACTO)
           ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border-2 border-teal-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-teal-600/30">
                2
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  Pregunta 2 de 3 • Segundo Factor Crítico
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  ¿Cuál considera que es la <span className="text-teal-700 font-extrabold underline decoration-teal-400">SEGUNDA CAUSA DETERMINANTE</span> de este fenómeno?
                </h3>
              </div>
            </div>
            {cause2 && (
              <button
                type="button"
                onClick={() => setCause2('')}
                className="text-xs text-slate-400 hover:text-red-600 self-start sm:self-center font-medium transition-colors"
              >
                Deseleccionar
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Seleccione el segundo factor de mayor relevancia (la opción elegida en la Pregunta 1 no está disponible):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CAUSES_LIST.map((cause) => {
              const { disabled, reason } = isOptionDisabled(cause.id, 2);
              const isSelected = cause2 === cause.id;

              return (
                <div
                  key={cause.id}
                  onClick={() => {
                    if (!disabled) {
                      setCause2(cause.id);
                      if (errorMsg) setErrorMsg(null);
                    }
                  }}
                  className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20 shadow-sm'
                      : disabled
                      ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-teal-600 bg-teal-600 text-white'
                            : disabled
                            ? 'border-slate-300 bg-slate-100'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {cause.code}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cause.badgeColor}`}>
                          {cause.category}
                        </span>
                        {disabled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            {reason}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                        {cause.shortTitle}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {cause.fullDescription}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            PREGUNTA 3: TERCERA CAUSA (3° IMPACTO)
           ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border-2 border-amber-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-amber-600/30">
                3
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Pregunta 3 de 3 • Tercer Factor Complementario
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  ¿Cuál considera que es la <span className="text-amber-700 font-extrabold underline decoration-amber-400">TERCERA CAUSA COMPLEMENTARIA</span> que explica esta situación?
                </h3>
              </div>
            </div>
            {cause3 && (
              <button
                type="button"
                onClick={() => setCause3('')}
                className="text-xs text-slate-400 hover:text-red-600 self-start sm:self-center font-medium transition-colors"
              >
                Deseleccionar
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Seleccione la tercera causa (las opciones elegidas en la Pregunta 1 y 2 no están disponibles):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CAUSES_LIST.map((cause) => {
              const { disabled, reason } = isOptionDisabled(cause.id, 3);
              const isSelected = cause3 === cause.id;

              return (
                <div
                  key={cause.id}
                  onClick={() => {
                    if (!disabled) {
                      setCause3(cause.id);
                      if (errorMsg) setErrorMsg(null);
                    }
                  }}
                  className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-sm'
                      : disabled
                      ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-amber-600 bg-amber-600 text-white'
                            : disabled
                            ? 'border-slate-300 bg-slate-100'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {cause.code}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cause.badgeColor}`}>
                          {cause.category}
                        </span>
                        {disabled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            {reason}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                        {cause.shortTitle}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {cause.fullDescription}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Observations */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Observaciones o Propuestas de Solución <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <textarea
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Aporte detalles adicionales sobre la realidad archivística de su entidad o municipio (ej. estado de las TRD, almacenamiento, inspecciones del Consejo Departamental de Archivos, etc.)."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all resize-y"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors order-2 sm:order-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpiar Formulario</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-lg shadow-emerald-700/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 order-1 sm:order-2"
          >
            {isSubmitting ? (
              <span>Registrando respuesta...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Enviar Diagnóstico</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Modal when submitted */}
      {submittedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-700 to-teal-900 p-6 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                ¡Respuesta Registrada con Éxito!
              </h3>
              <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
                Su aporte contribuye significativamente al diagnóstico de la aplicación de la Ley 594 de 2000 en el Valle del Cauca.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="font-semibold text-slate-800 text-sm mb-1 pb-1 border-b border-slate-200">
                  Resumen de Causas Seleccionadas:
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span className="font-bold text-slate-900">Causa Principal:</span>{' '}
                    {getCauseById(submittedResponse.cause1)?.shortTitle}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <div>
                    <span className="font-bold text-slate-900">Segunda Causa:</span>{' '}
                    {getCauseById(submittedResponse.cause2)?.shortTitle}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                  <div>
                    <span className="font-bold text-slate-900">Tercera Causa:</span>{' '}
                    {getCauseById(submittedResponse.cause3)?.shortTitle}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittedResponse(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
                >
                  Registrar otra respuesta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedResponse(null);
                    onOpenAdmin();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-colors text-center"
                >
                  <span>Ver resultados generales</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
