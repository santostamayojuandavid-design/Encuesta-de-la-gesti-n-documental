import { SurveyResponse } from '../types';
import { CAUSES_LIST } from '../data/causes';

const getCauseTitle = (id: string): string => {
  const match = CAUSES_LIST.find((c) => c.id === id);
  return match ? `${match.shortTitle} (${match.code})` : id;
};

export interface SyncResult {
  success: boolean;
  message: string;
  rowsAdded?: number;
  spreadsheetUrl?: string;
  errorDetails?: string;
}

export const syncResponsesToGoogleSheets = async (
  spreadsheetId: string,
  responses: SurveyResponse[],
  accessToken: string,
  sheetName: string = 'Respuestas_Ley594'
): Promise<SyncResult> => {
  const cleanId = spreadsheetId.trim();
  if (!cleanId) {
    return {
      success: false,
      message: 'Debe ingresar un ID válido de la Hoja de Cálculo de Google.'
    };
  }

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;

  try {
    // 1. Verify access to spreadsheet and fetch metadata
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!metaRes.ok) {
      if (metaRes.status === 404) {
        throw new Error(
          'No se encontró la Hoja de Cálculo con el ID proporcionado. Verifique que el ID sea correcto.'
        );
      }
      if (metaRes.status === 403) {
        throw new Error(
          'Permiso denegado: Su cuenta de Google no tiene permisos de edición sobre esta hoja de cálculo. Por favor asegúrese de tener acceso de Editor en el documento.'
        );
      }
      const errorJson = await metaRes.json().catch(() => ({}));
      throw new Error(
        errorJson?.error?.message ||
          `Error ${metaRes.status} al conectar con la Hoja de Cálculo.`
      );
    }

    const spreadsheetData = await metaRes.json();
    const sheets = spreadsheetData.sheets || [];
    const firstSheetTitle = sheets[0]?.properties?.title || 'Hoja 1';

    // Target either the requested sheet or the first sheet
    const targetSheetTitle = sheets.some(
      (s: any) => s.properties?.title === sheetName
    )
      ? sheetName
      : firstSheetTitle;

    // 2. Check if headers already exist in the target sheet
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
        targetSheetTitle
      )}!A1:J1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const readData = await readRes.json().catch(() => ({ values: [] }));
    const hasHeaders = readData.values && readData.values.length > 0 && readData.values[0]?.length > 0;

    const headers = [
      'ID Registro',
      'Fecha y Hora (ISO)',
      'Municipio del Valle del Cauca',
      'Tipo de Entidad',
      'Nombre de la Entidad',
      'Cargo / Rol del Encuestado',
      'Causa Principal (Mayor Impacto)',
      'Segunda Causa',
      'Tercera Causa',
      'Observaciones y Diagnóstico'
    ];

    // If headers don't exist, insert them first
    if (!hasHeaders) {
      const headerRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
          targetSheetTitle
        )}!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            range: `${targetSheetTitle}!A1`,
            majorDimension: 'ROWS',
            values: [headers]
          })
        }
      );

      if (!headerRes.ok) {
        const hErr = await headerRes.json().catch(() => ({}));
        throw new Error(hErr?.error?.message || 'Error al crear encabezados en la hoja de cálculo');
      }
    }

    // 3. Prepare rows to append
    const rows = responses.map((r) => [
      r.id,
      new Date(r.timestamp).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Bogota'
      }),
      r.municipality,
      r.entityType,
      r.entityName || 'No especificada',
      r.respondentRole,
      getCauseTitle(r.cause1),
      getCauseTitle(r.cause2),
      getCauseTitle(r.cause3),
      r.observations || 'Sin observaciones'
    ]);

    if (rows.length === 0) {
      return {
        success: true,
        message: 'No hay respuestas para enviar todavía.',
        rowsAdded: 0,
        spreadsheetUrl
      };
    }

    // 4. Append values to the spreadsheet
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(
        targetSheetTitle
      )}!A2:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: `${targetSheetTitle}!A2`,
          majorDimension: 'ROWS',
          values: rows
        })
      }
    );

    if (!appendRes.ok) {
      const appErr = await appendRes.json().catch(() => ({}));
      throw new Error(appErr?.error?.message || 'Error al agregar filas en Google Sheets');
    }

    return {
      success: true,
      message: `¡Se enviaron exitosamente ${rows.length} respuesta(s) a la Hoja de Cálculo (${targetSheetTitle})!`,
      rowsAdded: rows.length,
      spreadsheetUrl
    };
  } catch (err: any) {
    console.error('Error in syncResponsesToGoogleSheets:', err);
    return {
      success: false,
      message: err.message || 'Error al comunicarse con Google Sheets API.',
      errorDetails: err.stack,
      spreadsheetUrl
    };
  }
};
