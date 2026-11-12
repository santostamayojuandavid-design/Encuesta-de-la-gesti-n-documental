import { CauseStat, GoogleSheetsConfig, SurveyResponse } from '../types';
import { CAUSES_LIST, INITIAL_RESPONSES } from '../data/causes';

const RESPONSES_KEY = 'valle_ley594_responses_v1';
const SHEETS_CONFIG_KEY = 'valle_ley594_sheets_config_v1';

export const loadStoredResponses = (): SurveyResponse[] => {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY);
    if (!raw) {
      // Seed with initial realistic diagnostic responses
      localStorage.setItem(RESPONSES_KEY, JSON.stringify(INITIAL_RESPONSES));
      return INITIAL_RESPONSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RESPONSES;
  } catch (e) {
    console.error('Error loading stored responses:', e);
    return INITIAL_RESPONSES;
  }
};

export const saveResponse = (response: Omit<SurveyResponse, 'id' | 'timestamp'>): SurveyResponse => {
  const responses = loadStoredResponses();
  const newResponse: SurveyResponse = {
    ...response,
    id: `enc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString()
  };

  const updated = [newResponse, ...responses];
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(updated));
  return newResponse;
};

export const resetToInitialResponses = (): SurveyResponse[] => {
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(INITIAL_RESPONSES));
  return INITIAL_RESPONSES;
};

export const clearAllResponses = (): SurveyResponse[] => {
  localStorage.setItem(RESPONSES_KEY, JSON.stringify([]));
  return [];
};

export const deleteResponseById = (id: string): SurveyResponse[] => {
  const current = loadStoredResponses();
  const filtered = current.filter((r) => r.id !== id);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(filtered));
  return filtered;
};

export const loadSheetsConfig = (): GoogleSheetsConfig => {
  try {
    const raw = localStorage.getItem(SHEETS_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading sheets config:', e);
  }
  return {
    spreadsheetId: '',
    sheetName: 'Respuestas_Ley594',
    autoSync: false,
    status: 'idle'
  };
};

export const saveSheetsConfig = (config: Partial<GoogleSheetsConfig>): GoogleSheetsConfig => {
  const current = loadSheetsConfig();
  const updated: GoogleSheetsConfig = { ...current, ...config };
  localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Computes frequency statistics across all responses.
 * Highlights the Top 3 causes by total frequency and by weighted scoring.
 */
export const calculateCauseStats = (responses: SurveyResponse[]): CauseStat[] => {
  const statsMap = new Map<
    string,
    { count1: number; count2: number; count3: number; totalCount: number; weightedScore: number }
  >();

  CAUSES_LIST.forEach((cause) => {
    statsMap.set(cause.id, {
      count1: 0,
      count2: 0,
      count3: 0,
      totalCount: 0,
      weightedScore: 0
    });
  });

  responses.forEach((resp) => {
    // Cause 1 (Principal) gets count1 and weight 3
    if (statsMap.has(resp.cause1)) {
      const entry = statsMap.get(resp.cause1)!;
      entry.count1 += 1;
      entry.totalCount += 1;
      entry.weightedScore += 3;
    }
    // Cause 2 (Secundaria) gets count2 and weight 2
    if (statsMap.has(resp.cause2)) {
      const entry = statsMap.get(resp.cause2)!;
      entry.count2 += 1;
      entry.totalCount += 1;
      entry.weightedScore += 2;
    }
    // Cause 3 (Terciaria) gets count3 and weight 1
    if (statsMap.has(resp.cause3)) {
      const entry = statsMap.get(resp.cause3)!;
      entry.count3 += 1;
      entry.totalCount += 1;
      entry.weightedScore += 1;
    }
  });

  const totalSurveys = responses.length || 1;

  const result: CauseStat[] = CAUSES_LIST.map((cause) => {
    const counts = statsMap.get(cause.id) || {
      count1: 0,
      count2: 0,
      count3: 0,
      totalCount: 0,
      weightedScore: 0
    };
    return {
      causeId: cause.id,
      cause,
      rank: 0, // Assigned after sorting
      count1: counts.count1,
      count2: counts.count2,
      count3: counts.count3,
      totalCount: counts.totalCount,
      weightedScore: counts.weightedScore,
      percentageOfSurveys: Math.round((counts.totalCount / totalSurveys) * 100)
    };
  });

  // Sort primarily by total frequency descending, then by weighted score descending
  result.sort((a, b) => {
    if (b.totalCount !== a.totalCount) {
      return b.totalCount - a.totalCount;
    }
    return b.weightedScore - a.weightedScore;
  });

  // Assign ranks
  result.forEach((stat, idx) => {
    stat.rank = idx + 1;
  });

  return result;
};
