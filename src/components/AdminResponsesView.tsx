import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Table as TableIcon,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  RotateCcw,
  Plus,
  Trash2,
  Building2,
  MapPin,
  Calendar,
  Award,
  Layers,
  Info,
  ChevronDown,
  Eye,
  LogOut,
  Sparkles,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CauseStat, GoogleSheetsConfig, SurveyResponse } from '../types';
import { CAUSES_LIST, MUNICIPALITIES_VALLE, ENTITY_TYPES } from '../data/causes';
import { calculateCauseStats, saveSheetsConfig } from '../services/storage';
import { syncResponsesToGoogleSheets, SyncResult } from '../services/googleSheets';
import { googleSignIn, logout, getAccessToken } from '../services/firebaseAuth';

interface AdminResponsesViewProps {
  responses: SurveyResponse[];
  onLockAdmin: () => void;
  onDeleteResponse: (id: string) => void;
  onResetSamples: () => void;
  onClearAll: () => void;
  sheetsConfig: GoogleSheetsConfig;
  onUpdateSheetsConfig: (config: Partial<GoogleSheetsConfig>) => void;
}

export const AdminResponsesView: React.FC<AdminResponsesViewProps> = ({
  responses,
  onLockAdmin,
  onDeleteResponse,
  onResetSamples,
  onClearAll,
  sheetsConfig,
  onUpdateSheetsConfig
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'sheets'>('chart');
  const [metricMode, setMetricMode] = useState<'total' | 'weighted'>('total');

  // Search & Filters for Table
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMun, setFilterMun] = useState<string>('todos');
  const [filterEntity, setFilterEntity] = useState<string>('todos');
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  // Google Sheets state
  const [sheetIdInput, setSheetIdInput] = useState(sheetsConfig.spreadsheetId || '');
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Stats calculation
  const stats: CauseStat[] = calculateCauseStats(responses);
  const top3 = stats.slice(0, 3);
  const maxStatValue = Math.max(
    ...stats.map((s) => (metricMode === 'total' ? s.totalCount : s.weightedScore)),
    1
  );

  // Filtered responses for table
  const filteredResponses = responses.filter((resp) => {
    const matchesSearch =
      (resp.entityName && resp.entityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      resp.respondentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resp.observations && resp.observations.toLowerCase().includes(searchTerm.toLowerCase())) ||
      resp.municipality.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMun = filterMun === 'todos' || resp.municipality === filterMun;
    const matchesEntity = filterEntity === 'todos' || resp.entityType === filterEntity;

    return matchesSearch && matchesMun && matchesEntity;
  });

  const getCauseTitle = (id: string) => {
    return CAUSES_LIST.find((c) => c.id === id)?.shortTitle || id;
  };

  const getCauseCode = (id: string) => {
    return CAUSES_LIST.find((c) => c.id === id)?.code || '';
  };

  // Export CSV
  const handleExportCSV = () => {
    if (responses.length === 0) return;

    const headers = [
      'ID',
      'Fecha',
      'Municipio',
      'Tipo de Entidad',
      'Nombre Entidad',
      'Cargo',
      'Causa 1 (Principal)',
      'Segunda Causa',
      'Tercera Causa',
      'Observaciones'
    ];

    const rows = responses.map((r) => [
      r.id,
      r.timestamp,
      `"${r.municipality.replace(/"/g, '""')}"`,
      `"${r.entityType.replace(/"/g, '""')}"`,
      `"${(r.entityName || '').replace(/"/g, '""')}"`,
      `"${r.respondentRole.replace(/"/g, '""')}"`,
      `"${getCauseTitle(r.cause1).replace(/"/g, '""')}"`,
      `"${getCauseTitle(r.cause2).replace(/"/g, '""')}"`,
      `"${getCauseTitle(r.cause3).replace(/"/g, '""')}"`,
      `"${(r.observations || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Diagnostico_Ley594_Valle_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Auth handler
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAuthError(null);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error al autenticarse con Google');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGoogleUser(null);
    setSyncResult(null);
  };

  // One-click copy formatted data for Google Sheets
  const handleCopyToClipboard = () => {
    if (responses.length === 0) return;

    const headers = [
      'ID Registro',
      'Fecha',
      'Municipio',
      'Tipo de Entidad',
      'Nombre Entidad',
      'Cargo',
      'Causa Principal (Mayor Impacto)',
      'Segunda Causa',
      'Tercera Causa',
      'Observaciones'
    ];

    const rows = responses.map((r) => [
      r.id,
      new Date(r.timestamp).toLocaleString('es-CO'),
      r.municipality,
      r.entityType,
      r.entityName || 'No indicada',
      r.respondentRole,
      getCauseTitle(r.cause1),
      getCauseTitle(r.cause2),
      getCauseTitle(r.cause3),
      r.observations || 'Sin observaciones'
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 3000);
    });
  };

  // Sync to Google Sheets
  const handleSyncToSheets = async () => {
    const cleanId = sheetIdInput.trim();
    if (!cleanId) {
      setSyncResult({
        success: false,
        message: 'Por favor ingrese el ID de la Hoja de Cálculo de Google antes de sincronizar.'
      });
      return;
    }

    let token = await getAccessToken();
    if (!token) {
      // Need auth first
      try {
        const loginRes = await googleSignIn();
        if (loginRes) {
          setGoogleUser(loginRes.user);
          token = loginRes.accessToken;
        } else {
          setSyncResult({
            success: false,
            message: 'La ventana de autorización de Google fue cerrada. Para enviar mediante la API oficial, complete el inicio de sesión, o utilice el botón de "Copiar al Portapapeles" para pegar directamente en su hoja.'
          });
          return;
        }
      } catch (err: any) {
        setSyncResult({
          success: false,
          message: err.message || 'Es necesario iniciar sesión con Google para sincronizar.'
        });
        return;
      }
    }

    setIsSyncing(true);
    setSyncResult(null);

    // Save ID in config
    onUpdateSheetsConfig({
      spreadsheetId: cleanId,
      status: 'syncing'
    });

    try {
      const result = await syncResponsesToGoogleSheets(cleanId, responses, token);
      setSyncResult(result);

      if (result.success) {
        onUpdateSheetsConfig({
          spreadsheetId: cleanId,
          lastSyncTime: new Date().toISOString(),
          lastSyncCount: responses.length,
          status: 'success'
        });
      } else {
        onUpdateSheetsConfig({
          status: 'error',
          errorMessage: result.message
        });
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || 'Error inesperado al sincronizar con Google Sheets.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar with Security Context */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              Área Administrativa Autenticada
            </span>
            <span className="text-xs text-slate-400">Contraseña verificada</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Panel de Resultados y Diagnóstico Estadístico
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Análisis de frecuencia de las 3 causas determinantes en entidades del Valle del Cauca (Ley 594 de 2000).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sincronizar Google Sheets</span>
          </button>

          <button
            onClick={onLockAdmin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/50 transition-colors"
            title="Bloquear y salir del modo administrador"
          >
            <Lock className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total surveys */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Respuestas</span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <TableIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{responses.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            Encuestas analizadas en tiempo real
          </div>
        </div>

        {/* Top 1 Cause */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-900 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              🥇 Causa Principal #1
            </span>
            <span className="text-xl">🏆</span>
          </div>
          <div className="text-sm font-extrabold text-amber-950 line-clamp-1">
            {top3[0]?.cause.shortTitle || 'Sin datos'}
          </div>
          <div className="text-xs text-amber-800 font-medium mt-1">
            {top3[0]?.totalCount || 0} menciones ({top3[0]?.percentageOfSurveys || 0}% de encuestas)
          </div>
        </div>

        {/* Top 2 Cause */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              🥈 Segunda Causa #2
            </span>
            <span className="text-lg">🥈</span>
          </div>
          <div className="text-sm font-extrabold text-slate-900 line-clamp-1">
            {top3[1]?.cause.shortTitle || 'Sin datos'}
          </div>
          <div className="text-xs text-slate-600 font-medium mt-1">
            {top3[1]?.totalCount || 0} menciones ({top3[1]?.percentageOfSurveys || 0}% de encuestas)
          </div>
        </div>

        {/* Top 3 Cause */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-5 border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between text-orange-900 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              🥉 Tercera Causa #3
            </span>
            <span className="text-lg">🥉</span>
          </div>
          <div className="text-sm font-extrabold text-orange-950 line-clamp-1">
            {top3[2]?.cause.shortTitle || 'Sin datos'}
          </div>
          <div className="text-xs text-orange-800 font-medium mt-1">
            {top3[2]?.totalCount || 0} menciones ({top3[2]?.percentageOfSurveys || 0}% de encuestas)
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'chart'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Gráfico y Análisis de Causas</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'table'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>Tabla de Respuestas ({responses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'sheets'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets</span>
          {sheetsConfig.spreadsheetId && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* ==========================================================
          TAB 1: GRÁFICO Y ANÁLISIS DE FRECUENCIA
         ========================================================== */}
      {activeTab === 'chart' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top 3 Podium Cards */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Jerarquización de Causas
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Las 3 Principales Causas Según Frecuencia en el Valle del Cauca
                </h3>
              </div>
              <div className="text-xs text-slate-500">
                Calculado a partir de las 3 opciones seleccionadas por cada entidad
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {top3.map((stat, idx) => {
                const medalBg =
                  idx === 0
                    ? 'from-amber-500/20 via-amber-400/10 to-transparent border-amber-300'
                    : idx === 1
                    ? 'from-slate-400/20 via-slate-300/10 to-transparent border-slate-300'
                    : 'from-orange-400/20 via-orange-300/10 to-transparent border-orange-300';

                const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                const medalLabel =
                  idx === 0 ? '1° Causa Principal' : idx === 1 ? '2ª Causa' : '3ª Causa';

                return (
                  <div
                    key={stat.causeId}
                    className={`rounded-2xl p-5 border-2 bg-gradient-to-b ${medalBg} shadow-sm relative flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-white shadow-sm border border-slate-200 flex items-center gap-1.5">
                          <span>{medalEmoji}</span>
                          <span>{medalLabel}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded">
                          {stat.cause.code}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-snug mb-2">
                        {stat.cause.shortTitle}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {stat.cause.fullDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 bg-white/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700">Frecuencia Total:</span>
                        <span className="font-extrabold text-sm text-slate-900">
                          {stat.totalCount} votos ({stat.percentageOfSurveys}%)
                        </span>
                      </div>

                      {/* Distribution breakdown */}
                      <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center pt-1 font-medium">
                        <div className="bg-emerald-100/70 text-emerald-900 p-1 rounded">
                          <span className="block font-bold">{stat.count1}</span> 1ª Causa
                        </div>
                        <div className="bg-teal-100/70 text-teal-900 p-1 rounded">
                          <span className="block font-bold">{stat.count2}</span> 2ª Causa
                        </div>
                        <div className="bg-amber-100/70 text-amber-900 p-1 rounded">
                          <span className="block font-bold">{stat.count3}</span> 3ª Causa
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Frequency Chart */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Distribución Comparativa de Todas las Causas (Ranking General)
                </h3>
                <p className="text-xs text-slate-500">
                  Desglose de frecuencia de cada causa según su posición (1ª Causa, 2ª Causa, 3ª Causa)
                </p>
              </div>

              {/* Toggle metric */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-center">
                <button
                  onClick={() => setMetricMode('total')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    metricMode === 'total'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Frecuencia de Votos
                </button>
                <button
                  onClick={() => setMetricMode('weighted')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    metricMode === 'weighted'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Puntaje Ponderado (3-2-1)
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-4 text-xs font-medium text-slate-600 mb-6 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600" />
                Votada como Causa Principal (1ª)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-teal-500" />
                Votada como 2ª Causa
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" />
                Votada como 3ª Causa
              </span>
            </div>

            {/* Bars */}
            <div className="space-y-4">
              {stats.map((stat, idx) => {
                const total = metricMode === 'total' ? stat.totalCount : stat.weightedScore;
                const percentage = Math.round((total / maxStatValue) * 100);

                const p1 = stat.totalCount > 0 ? (stat.count1 / stat.totalCount) * 100 : 0;
                const p2 = stat.totalCount > 0 ? (stat.count2 / stat.totalCount) * 100 : 0;
                const p3 = stat.totalCount > 0 ? (stat.count3 / stat.totalCount) * 100 : 0;

                const isTop3 = idx < 3;

                return (
                  <div key={stat.causeId} className="group">
                    <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-900'
                              : idx === 2
                              ? 'bg-orange-300 text-orange-950'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-mono font-bold text-slate-500">{stat.cause.code}</span>
                        <span className={`font-bold truncate ${isTop3 ? 'text-slate-900' : 'text-slate-700'}`}>
                          {stat.cause.shortTitle}
                        </span>
                      </div>

                      <div className="text-right shrink-0 font-extrabold text-slate-900 font-mono">
                        {metricMode === 'total' ? (
                          <span>{stat.totalCount} votos ({stat.percentageOfSurveys}%)</span>
                        ) : (
                          <span>{stat.weightedScore} pts</span>
                        )}
                      </div>
                    </div>

                    {/* Stacked bar */}
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex shadow-inner">
                      <div
                        style={{ width: `${(percentage * p1) / 100}%` }}
                        className="bg-emerald-600 transition-all duration-500 hover:brightness-110"
                        title={`${stat.count1} votos como Causa Principal`}
                      />
                      <div
                        style={{ width: `${(percentage * p2) / 100}%` }}
                        className="bg-teal-500 transition-all duration-500 hover:brightness-110"
                        title={`${stat.count2} votos como 2ª Causa`}
                      />
                      <div
                        style={{ width: `${(percentage * p3) / 100}%` }}
                        className="bg-amber-500 transition-all duration-500 hover:brightness-110"
                        title={`${stat.count3} votos como 3ª Causa`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 2: TABLA DE RESPUESTAS
         ========================================================== */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          {/* Filters Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por entidad, cargo, observación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Municipality Filter */}
              <select
                value={filterMun}
                onChange={(e) => setFilterMun(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="todos">Todos los Municipios</option>
                {MUNICIPALITIES_VALLE.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Entity Type Filter */}
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none max-w-xs truncate"
              >
                <option value="todos">Todos los Tipos de Entidad</option>
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <button
                onClick={onResetSamples}
                className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-200/80 hover:bg-slate-300 rounded-xl transition-colors"
                title="Cargar respuestas de prueba"
              >
                Restablecer Muestra
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Municipio & Entidad</th>
                  <th className="py-3 px-4">Cargo / Rol</th>
                  <th className="py-3 px-4 text-emerald-800">1ª Causa Principal</th>
                  <th className="py-3 px-4 text-teal-800">2ª Causa</th>
                  <th className="py-3 px-4 text-amber-800">3ª Causa</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredResponses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No se encontraron respuestas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredResponses.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{r.municipality}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {r.entityName || r.entityType}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-[160px] truncate">
                        {r.respondentRole}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-1 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                          {getCauseCode(r.cause1)} - {getCauseTitle(r.cause1)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-1 rounded bg-teal-100 text-teal-900 font-medium text-[11px]">
                          {getCauseCode(r.cause2)} - {getCauseTitle(r.cause2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-900 font-medium text-[11px]">
                          {getCauseCode(r.cause3)} - {getCauseTitle(r.cause3)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedResponse(r)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Ver detalle completo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Desea eliminar esta respuesta del registro?')) {
                                onDeleteResponse(r.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Mostrando {filteredResponses.length} de {responses.length} respuestas registradas
            </span>
            {responses.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('¿Está seguro de que desea borrar TODAS las respuestas del registro?')) {
                    onClearAll();
                  }
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Limpiar todas las respuestas
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==========================================================
          TAB 3: GOOGLE SHEETS SYNC
         ========================================================== */}
      {activeTab === 'sheets' && (
        <div className="space-y-6 animate-fade-in">
          {/* Card Google Sheets Sync */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Exportar y Sincronizar con Hoja de Cálculo de Google (Google Sheets)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Conecte su hoja de cálculo mediante su ID único. Las respuestas recolectadas serán enviadas como filas formateadas incluyendo fecha, municipio, entidad, cargo, y las 3 causas jerarquizadas.
                </p>
              </div>
            </div>

            {/* Step 1: Input Spreadsheet ID */}
            <div className="py-6 border-b border-slate-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ID de la Hoja de Cálculo de Google (Spreadsheet ID) <span className="text-emerald-600">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={sheetIdInput}
                    onChange={(e) => setSheetIdInput(e.target.value)}
                    placeholder="Ej. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                  />
                  {sheetIdInput && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${sheetIdInput.trim()}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <span>Abrir Hoja</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Helper box explaining where to find the ID */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900 mb-1">
                  <Info className="w-4 h-4 shrink-0 text-emerald-700" />
                  ¿Cómo obtener el ID de su Hoja de Cálculo de Google?
                </div>
                <p className="leading-relaxed">
                  Abra o cree su documento en Google Sheets. Observe la barra de direcciones de su navegador; el ID es la serie alfanumérica entre <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">/d/</code> y <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">/edit</code>:
                </p>
                <div className="mt-2 p-2 bg-white rounded-lg border border-emerald-300/60 font-mono text-[11px] text-slate-700 overflow-x-auto">
                  https://docs.google.com/spreadsheets/d/<span className="bg-amber-200 px-1 py-0.5 rounded font-bold text-amber-950">1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms</span>/edit
                </div>
              </div>
            </div>

            {/* Step 2: Google Account Connection */}
            <div className="py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Cuenta de Google Autorizada
                </div>
                {googleUser ? (
                  <div className="flex items-center gap-2.5">
                    {googleUser.photoURL ? (
                      <img
                        src={googleUser.photoURL}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full border border-emerald-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        {googleUser.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900">{googleUser.displayName || 'Usuario de Google'}</div>
                      <div className="text-xs text-slate-500">{googleUser.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    No ha conectado una cuenta de Google aún. Inicie sesión para enviar los datos.
                  </div>
                )}
              </div>

              <div>
                {googleUser ? (
                  <button
                    onClick={handleGoogleLogout}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desconectar Cuenta</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticating}
                    className="gsi-material-button flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs text-xs font-bold text-slate-700 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>{isAuthenticating ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
                  </button>
                )}
              </div>
            </div>

            {authError && (
              <div className="my-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* Step 3: Trigger Sync via API */}
            <div className="py-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                    Opción A: Envío Automático mediante API de Google Sheets
                  </div>
                  <div className="text-xs text-slate-500">
                    Se enviarán <strong>{responses.length}</strong> respuestas directamente al documento con ID: <code className="font-mono text-emerald-700 font-bold">{sheetIdInput || 'No ingresado'}</code>
                  </div>
                </div>

                <button
                  onClick={handleSyncToSheets}
                  disabled={isSyncing}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando con Google Sheets...' : 'Enviar Respuestas a Google Sheets'}</span>
                </button>
              </div>

              {/* Sync Result Feedback */}
              {syncResult && (
                <div
                  className={`mt-4 p-4 rounded-xl text-xs border flex items-start gap-3 animate-fade-in ${
                    syncResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  {syncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <strong className="block font-bold mb-1">
                      {syncResult.success ? '¡Sincronización Exitosa!' : 'Información de Envío'}
                    </strong>
                    <p>{syncResult.message}</p>
                    {syncResult.spreadsheetUrl && (
                      <a
                        href={syncResult.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline mt-2"
                      >
                        <span>Abrir Hoja de Cálculo en Google Sheets</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Alternative Fast Copy & Paste for Google Sheets */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Opción B: Copia Directa al Portapapeles (100% Inmediato)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Si prefiere no iniciar sesión con Google o si el navegador bloquea ventanas emergentes, copie los datos tabulares y péguelos directamente en su hoja.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${
                      copiedToClipboard
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {copiedToClipboard ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>¡Copiado! Péguelo con Ctrl+V en A1</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Datos para Pegar en Sheets</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Descargar archivo CSV"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar CSV</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Instrucción rápida:</strong> 1. Haga clic en <em>"Copiar Datos para Pegar en Sheets"</em>. 2. Haga clic en <em>"Abrir Hoja"</em> arriba para ir a su Google Sheet con el ID. 3. Seleccione la primera celda (<strong>A1</strong>) y presione <strong>Ctrl + V</strong> (o <strong>Cmd + V</strong>). Todas las {responses.length} filas y encabezados se organizarán en sus columnas correspondientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Selected Response */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400">{selectedResponse.id}</span>
                <h3 className="text-base font-bold">Detalle de Encuesta de Diagnóstico</h3>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block">Municipio:</span>
                  <span className="text-sm font-bold text-slate-900">{selectedResponse.municipality}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block">Fecha y Hora:</span>
                  <span className="text-slate-800">{new Date(selectedResponse.timestamp).toLocaleString('es-CO')}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block">Tipo de Entidad:</span>
                  <span className="text-slate-800">{selectedResponse.entityType}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block">Nombre Entidad:</span>
                  <span className="text-slate-800">{selectedResponse.entityName || 'No indicada'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block">Cargo / Rol:</span>
                  <span className="text-slate-800">{selectedResponse.respondentRole}</span>
                </div>
              </div>

              {/* Causes */}
              <div className="space-y-2.5">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-900 font-extrabold uppercase text-[10px] tracking-wider block mb-1">
                    🥇 Causa Principal (Mayor Impacto)
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {getCauseTitle(selectedResponse.cause1)}
                  </div>
                  <p className="text-slate-600 mt-1">
                    {CAUSES_LIST.find((c) => c.id === selectedResponse.cause1)?.fullDescription}
                  </p>
                </div>

                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                  <span className="text-teal-900 font-extrabold uppercase text-[10px] tracking-wider block mb-1">
                    🥈 Segunda Causa Determinante
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {getCauseTitle(selectedResponse.cause2)}
                  </div>
                  <p className="text-slate-600 mt-1">
                    {CAUSES_LIST.find((c) => c.id === selectedResponse.cause2)?.fullDescription}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-amber-900 font-extrabold uppercase text-[10px] tracking-wider block mb-1">
                    🥉 Tercera Causa Complementaria
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {getCauseTitle(selectedResponse.cause3)}
                  </div>
                  <p className="text-slate-600 mt-1">
                    {CAUSES_LIST.find((c) => c.id === selectedResponse.cause3)?.fullDescription}
                  </p>
                </div>
              </div>

              {/* Observations */}
              {selectedResponse.observations && (
                <div className="pt-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">
                    Observaciones y Diagnóstico Cualitativo:
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 italic leading-relaxed">
                    "{selectedResponse.observations}"
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedResponse(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
