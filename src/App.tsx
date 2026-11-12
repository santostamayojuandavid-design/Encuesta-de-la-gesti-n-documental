import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SurveyForm } from './components/SurveyForm';
import { AdminResponsesView } from './components/AdminResponsesView';
import { PasswordModal } from './components/PasswordModal';
import { SurveyResponse, GoogleSheetsConfig } from './types';
import {
  loadStoredResponses,
  saveResponse,
  deleteResponseById,
  resetToInitialResponses,
  clearAllResponses,
  loadSheetsConfig,
  saveSheetsConfig
} from './services/storage';
import { initAuth } from './services/firebaseAuth';
import { syncResponsesToGoogleSheets } from './services/googleSheets';
import { getAccessToken } from './services/firebaseAuth';

export default function App() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [activeView, setActiveView] = useState<'survey' | 'admin'>('survey');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(loadSheetsConfig());

  // Initialize data on mount
  useEffect(() => {
    const loaded = loadStoredResponses();
    setResponses(loaded);

    // Initialize Firebase Auth listener
    const unsubscribe = initAuth();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleOpenAdmin = () => {
    if (isAdminUnlocked) {
      setActiveView('admin');
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSuccess = () => {
    setIsPasswordModalOpen(false);
    setIsAdminUnlocked(true);
    setActiveView('admin');
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    setActiveView('survey');
  };

  const handleSubmitResponse = async (data: Omit<SurveyResponse, 'id' | 'timestamp'>) => {
    const saved = saveResponse(data);
    const updated = [saved, ...responses];
    setResponses(updated);

    // If Google Sheets is configured and autoSync is enabled, trigger background sync
    if (sheetsConfig.spreadsheetId && sheetsConfig.autoSync) {
      const token = await getAccessToken();
      if (token) {
        syncResponsesToGoogleSheets(sheetsConfig.spreadsheetId, updated, token).catch((err) => {
          console.warn('Background sync error:', err);
        });
      }
    }
  };

  const handleDeleteResponse = (id: string) => {
    const updated = deleteResponseById(id);
    setResponses(updated);
  };

  const handleResetSamples = () => {
    const reset = resetToInitialResponses();
    setResponses(reset);
  };

  const handleClearAll = () => {
    const empty = clearAllResponses();
    setResponses(empty);
  };

  const handleUpdateSheetsConfig = (newConfig: Partial<GoogleSheetsConfig>) => {
    const updated = saveSheetsConfig(newConfig);
    setSheetsConfig(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Institutional Top Header */}
      <Header
        onOpenAdmin={handleOpenAdmin}
        isAdminUnlocked={isAdminUnlocked}
        activeView={activeView}
        onSwitchView={setActiveView}
        totalResponses={responses.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'survey' ? (
          <SurveyForm
            onSubmitSuccess={handleSubmitResponse}
            onOpenAdmin={handleOpenAdmin}
          />
        ) : (
          <AdminResponsesView
            responses={responses}
            onLockAdmin={handleLockAdmin}
            onDeleteResponse={handleDeleteResponse}
            onResetSamples={handleResetSamples}
            onClearAll={handleClearAll}
            sheetsConfig={sheetsConfig}
            onUpdateSheetsConfig={handleUpdateSheetsConfig}
          />
        )}
      </main>

      {/* Password verification modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="font-bold text-slate-200">
              Marco Normativo Archivístico Nacional • Ley 594 de 2000
            </div>
            <p className="mt-0.5 text-slate-500">
              Archivo General de la Nación (AGN) Colombia • Consejo Departamental de Archivos del Valle del Cauca.
            </p>
          </div>
          <div className="text-slate-500">
            Diagnóstico de Causas y Brechas en la Función Archivística Pública y Privada con Funciones Públicas
          </div>
        </div>
      </footer>
    </div>
  );
}
