// ─── Core Assessment Types ─────────────────────────────────────

export interface QuestionOption {
    level: number;       // 1–5
    title: string;       // Nombre corto del nivel
    description: string; // Descripción completa
}

export interface Question {
    id: string;
    dimension: 'procesos' | 'personas' | 'herramientas' | 'tecnologia';
    text: string;
    help: string;        // Explicación en lenguaje simple
    type: 'options' | 'priority' | 'open';
    options?: QuestionOption[];
}

export type ServiceType = 'bim' | 'ia' | 'plm';

export type PriorityLevel = 'baja' | 'media' | 'alta' | 'critica';

export type IndustryType = 'construccion' | 'manufactura' | 'servicios';

export type MaturityLevel =
    | 'Inicial'
    | 'Oportunista'
    | 'Sistemático'
    | 'Gestionado'
    | 'Optimizado';

// ─── Section Definitions ───────────────────────────────────────

export interface ServiceSection {
    key: ServiceType;
    title: string;
    description: string;
    icon: string;
    questionCount: number;
}

// ─── Assessment Data ───────────────────────────────────────────

export interface GeneralInfo {
    company: string;
    employees: string;
    industry: IndustryType | '';
    selectedServices: ServiceType[];
}

export interface ContactInfo {
    name: string;
    email: string;
    role: string;
}

export interface AssessmentAnswers {
    generalInfo: GeneralInfo;
    bim: Record<string, number | string>;
    ia: Record<string, number | string>;
    plm: Record<string, number | string>;
    priorities: Record<ServiceType, PriorityLevel>;
    objective: string;
    contact: ContactInfo;
}

// ─── Scoring ───────────────────────────────────────────────────

export interface ServiceScore {
    service: ServiceType;
    label: string;
    score: number;            // 1.0 – 5.0
    level: MaturityLevel;
    dimensionScores: {
        procesos: number;
        personas: number;
        herramientas: number;
        tecnologia: number;
    };
}

export interface AssessmentResult {
    id?: string;
    scores: ServiceScore[];
    globalScore: number;
    globalLevel: MaturityLevel;
    priorityRoadmap: ServiceScore[];  // ordered by priority
    aiAnalysis?: string;
    createdAt?: string;
    answers: AssessmentAnswers;
}

// ─── API Types ─────────────────────────────────────────────────

export interface AnalyzeRequest {
    answers: AssessmentAnswers;
    scores: ServiceScore[];
    globalScore: number;
}

export interface AnalyzeResponse {
    analysis: string;
    error?: string;
}

// ─── Supabase Row ──────────────────────────────────────────────

export interface AssessmentRow {
    id: string;
    company: string;
    industry: string;
    selected_services: ServiceType[];
    answers: AssessmentAnswers;
    scores: ServiceScore[];
    global_score: number;
    global_level: MaturityLevel;
    ai_analysis: string | null;
    contact_name: string;
    contact_email: string;
    contact_role: string;
    objective: string;
    created_at: string;
}
