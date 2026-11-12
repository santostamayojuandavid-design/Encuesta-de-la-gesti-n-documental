import { CauseOption, SurveyResponse } from '../types';

export const CAUSES_LIST: CauseOption[] = [
  {
    id: 'presupuesto_insuficiente',
    code: 'C-01',
    shortTitle: 'Insuficiencia Presupuestal y Financiera',
    fullDescription: 'Escasa o nula asignación de presupuesto específico para la función archivística, contratación técnica y adecuación de depósitos documentales.',
    category: 'Financiera',
    iconName: 'Coins',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'talento_humano_calificado',
    code: 'C-02',
    shortTitle: 'Falta de Talento Humano Profesional Idóneo',
    fullDescription: 'Carencia de personal con perfil profesional o técnico en Archivística; alta rotación por contratos temporales de prestación de servicios sin continuidad.',
    category: 'Talento Humano',
    iconName: 'UserX',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    id: 'cultura_directiva',
    code: 'C-03',
    shortTitle: 'Falta de Cultura Archivística y Apoyo Directivo',
    fullDescription: 'Desconocimiento normativo por parte de directivos y gerentes, falta de voluntad política y escasa priorización estratégica de los archivos institucionales.',
    category: 'Normativa y Gestión',
    iconName: 'Briefcase',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'instrumentos_archivisticos',
    code: 'C-04',
    shortTitle: 'Inexistencia o Desactualización de Instrumentos (TRD/PGD)',
    fullDescription: 'Falta de formulación, convalidación o actualización de Tablas de Retención Documental (TRD), Tablas de Valoración (TVD), PGD y PINAR ante el Consejo Departamental de Archivos.',
    category: 'Normativa y Gestión',
    iconName: 'FileSpreadsheet',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'tecnologia_sgdea',
    code: 'C-05',
    shortTitle: 'Brecha Tecnológica y Ausencia de SGDEA',
    fullDescription: 'Falta de implementación o mala parametrización de Sistemas de Gestión Documental Electrónica de Archivo (SGDEA) y dificultades en preservación digital a largo plazo.',
    category: 'Tecnología',
    iconName: 'Cpu',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  {
    id: 'control_auditoria_debil',
    code: 'C-06',
    shortTitle: 'Débil Control Interno y Falta de Fiscalización Externa',
    fullDescription: 'Escasos controles e inspecciones periódicas de auditorías internas, contralorías y del Consejo Departamental de Archivos del Valle del Cauca.',
    category: 'Control y Vigilancia',
    iconName: 'ShieldAlert',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'espacios_infraestructura',
    code: 'C-07',
    shortTitle: 'Infraestructura y Depósitos Físicos Inadecuados',
    fullDescription: 'Hacinamiento, sedes improvisadas, falta de estantería adecuada, filtraciones y riesgos de deterioro biológico/químico que violan el Acuerdo 049/2000 del AGN.',
    category: 'Infraestructura',
    iconName: 'Warehouse',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'resistencia_cambio',
    code: 'C-08',
    shortTitle: 'Resistencia al Cambio y Desarticulación Administrativa',
    fullDescription: 'Falta de articulación y comunicación entre las dependencias productoras de documentos y la unidad central de archivo, generando dispersión documental.',
    category: 'Normativa y Gestión',
    iconName: 'GitPullRequestDraft',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  }
];

export const MUNICIPALITIES_VALLE = [
  'Cali (Distrito Especial)',
  'Buenaventura (Distrito Especial)',
  'Palmira',
  'Guadalajara de Buga',
  'Tuluá',
  'Cartago',
  'Jamundí',
  'Yumbo',
  'Candelaria',
  'Florida',
  'Pradera',
  'Sevilla',
  'Zarzal',
  'Roldanillo',
  'El Cerrito',
  'Ginebra',
  'Guacarí',
  'Caicedonia',
  'La Unión',
  'Dagua',
  'Ansermanuevo',
  'Restrepo',
  'Otro Municipio del Valle'
];

export const ENTITY_TYPES = [
  'Alcaldía Municipal / Entidad Territorial',
  'Gobernación del Valle del Cauca / Secretaría Departamental',
  'Empresa Social del Estado (E.S.E. Hospital Público)',
  'Empresa de Servicios Públicos Domiciliarios (E.S.P.)',
  'Empresa Industrial y Comercial del Estado (E.I.C.E.)',
  'Instituto o Entidad Descentralizada',
  'Privada con Funciones Públicas (Notaría / Curaduría / Cámara de Comercio)',
  'Institución Educativa Oficial / Universidad Pública',
  'Otra entidad sujeta a Ley 594 de 2000'
];

export const ROLES_LIST = [
  'Responsable / Coordinador de Gestión Documental y Archivo',
  'Secretario(a) General o Director(a) Administrativo(a)',
  'Jefe de Control Interno / Auditor de Calidad',
  'Asesor(a) Jurídico(a) / Secretario(a) de Despacho',
  'Líder o Profesional de Tecnologías de la Información (TIC)',
  'Auxiliar o Técnico de Archivo',
  'Funcionario de dependencia productora de documentos',
  'Consultor / Asesor Archivístico Externo'
];

export const INITIAL_RESPONSES: SurveyResponse[] = [
  {
    id: 'resp-001',
    timestamp: '2026-11-10T09:15:00.000Z',
    municipality: 'Cali (Distrito Especial)',
    entityType: 'Gobernación del Valle del Cauca / Secretaría Departamental',
    entityName: 'Secretaría General Departamental',
    respondentRole: 'Responsable / Coordinador de Gestión Documental y Archivo',
    cause1: 'presupuesto_insuficiente',
    cause2: 'talento_humano_calificado',
    cause3: 'cultura_directiva',
    observations: 'La falta de presupuesto impide contratar profesionales de planta, dependiendo de OPS cortas que interrumpen los procesos de convalidación de TRD.'
  },
  {
    id: 'resp-002',
    timestamp: '2026-11-10T11:42:00.000Z',
    municipality: 'Palmira',
    entityType: 'Alcaldía Municipal / Entidad Territorial',
    entityName: 'Alcaldía de Palmira',
    respondentRole: 'Jefe de Control Interno / Auditor de Calidad',
    cause1: 'cultura_directiva',
    cause2: 'presupuesto_insuficiente',
    cause3: 'instrumentos_archivisticos',
    observations: 'Los directivos no ven la gestión documental como un proceso estratégico de transparencia, sino como almacenamiento de papeles viejos.'
  },
  {
    id: 'resp-003',
    timestamp: '2026-11-10T14:20:00.000Z',
    municipality: 'Buenaventura (Distrito Especial)',
    entityType: 'Empresa Social del Estado (E.S.E. Hospital Público)',
    entityName: 'E.S.E. Distrital Luis Ablanque',
    respondentRole: 'Responsable / Coordinador de Gestión Documental y Archivo',
    cause1: 'espacios_infraestructura',
    cause2: 'presupuesto_insuficiente',
    cause3: 'tecnologia_sgdea',
    observations: 'El clima húmedo de la costa pacífica deteriora rápidamente los soportes físicos y no contamos con bodegas con control termohigrométrico.'
  },
  {
    id: 'resp-004',
    timestamp: '2026-11-11T08:35:00.000Z',
    municipality: 'Guadalajara de Buga',
    entityType: 'Empresa de Servicios Públicos Domiciliarios (E.S.P.)',
    entityName: 'Aguas de Buga S.A. E.S.P.',
    respondentRole: 'Líder o Profesional de Tecnologías de la Información (TIC)',
    cause1: 'tecnologia_sgdea',
    cause2: 'talento_humano_calificado',
    cause3: 'resistencia_cambio',
    observations: 'Se adquirió un software pero no fue parametrizado conforme a los estándares de interoperabilidad y metadatos del AGN.'
  },
  {
    id: 'resp-005',
    timestamp: '2026-11-11T10:12:00.000Z',
    municipality: 'Tuluá',
    entityType: 'Alcaldía Municipal / Entidad Territorial',
    entityName: 'Alcaldía de Tuluá',
    respondentRole: 'Secretario(a) General o Director(a) Administrativo(a)',
    cause1: 'talento_humano_calificado',
    cause2: 'cultura_directiva',
    cause3: 'presupuesto_insuficiente',
    observations: 'En el centro del Valle es muy difícil encontrar archivistas profesionales graduados dispuestos a radicarse en municipios intermedios.'
  },
  {
    id: 'resp-006',
    timestamp: '2026-11-11T16:05:00.000Z',
    municipality: 'Cartago',
    entityType: 'Privada con Funciones Públicas (Notaría / Curaduría / Cámara de Comercio)',
    entityName: 'Cámara de Comercio de Cartago',
    respondentRole: 'Asesor(a) Jurídico(a) / Secretario(a) de Despacho',
    cause1: 'instrumentos_archivisticos',
    cause2: 'control_auditoria_debil',
    cause3: 'talento_humano_calificado',
    observations: 'Las entidades privadas con funciones públicas a veces creen erróneamente que la Ley 594 no las cobija con el mismo rigor que al sector público.'
  },
  {
    id: 'resp-007',
    timestamp: '2026-11-12T08:10:00.000Z',
    municipality: 'Yumbo',
    entityType: 'Empresa Industrial y Comercial del Estado (E.I.C.E.)',
    entityName: 'Empresa Oficial de Servicios de Yumbo',
    respondentRole: 'Responsable / Coordinador de Gestión Documental y Archivo',
    cause1: 'presupuesto_insuficiente',
    cause2: 'instrumentos_archivisticos',
    cause3: 'cultura_directiva',
    observations: 'Las TRD llevan más de 6 años sin actualizarse y el Consejo Departamental de Archivos tarda en emitir conceptos.'
  },
  {
    id: 'resp-008',
    timestamp: '2026-11-12T09:45:00.000Z',
    municipality: 'Jamundí',
    entityType: 'Alcaldía Municipal / Entidad Territorial',
    entityName: 'Municipio de Jamundí',
    respondentRole: 'Jefe de Control Interno / Auditor de Calidad',
    cause1: 'cultura_directiva',
    cause2: 'talento_humano_calificado',
    cause3: 'control_auditoria_debil',
    observations: 'Falta mayor régimen sancionatorio efectivo para los alcaldes que entregan administraciones con archivos en sacos de basura o en desorden total.'
  }
];
