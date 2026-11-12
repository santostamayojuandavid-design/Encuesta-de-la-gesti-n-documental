export interface CauseOption {
  id: string;
  code: string;
  shortTitle: string;
  fullDescription: string;
  category: 'Financiera' | 'Talento Humano' | 'Normativa y Gestión' | 'Tecnología' | 'Infraestructura' | 'Control y Vigilancia';
  iconName: string;
  badgeColor: string;
}

export interface SurveyResponse {
  id: string;
  timestamp: string;
  municipality: string;
  entityType: string;
  entityName?: string;
  respondentRole: string;
  cause1: string; // ID of Causa Principal
  cause2: string; // ID of Causa Secundaria
  cause3: string; // ID of Causa Terciaria
  observations?: string;
}

export interface CauseStat {
  causeId: string;
  cause: CauseOption;
  rank: number;
  count1: number;
  count2: number;
  count3: number;
  totalCount: number;
  weightedScore: number;
  percentageOfSurveys: number;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime?: string;
  lastSyncCount?: number;
  status?: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}
