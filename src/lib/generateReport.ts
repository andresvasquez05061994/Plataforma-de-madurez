import { AssessmentAnswers, ServiceScore, ServiceType } from '@/types/assessment';

// ── Breach texts per dimension per service (score < 3 = critical) ──

const BREACH_TEXT: Record<string, Record<string, { breach: string; next: string }>> = {
    bim: {
        'D1 · Procesos': {
            breach: 'Intercambio de información sin estándares formales — sin BEP ni ISO 19650.',
            next: 'Implementar Plan de Ejecución BIM (BEP) y flujo formal de aprobaciones.',
        },
        'D2 · Personas': {
            breach: 'Sin roles BIM formales definidos — responsabilidad diluida en el equipo.',
            next: 'Definir y contratar BIM Manager + Coordinadores por disciplina.',
        },
        'D3 · Herramientas': {
            breach: 'Software CAD 2D como herramienta principal, sin modelado paramétrico.',
            next: 'Migrar a plataforma BIM paramétrica (Revit/Archicad) + CDE en la nube.',
        },
        'D4 · Tecnología': {
            breach: 'Formatos propietarios sin política de interoperabilidad definida.',
            next: 'Establecer política OpenBIM con IFC/BCF exigido contractualmente.',
        },
    },
    ia: {
        'D1 · Procesos': {
            breach: 'Sin proceso formal de identificación de iniciativas — operación 100% ad-hoc.',
            next: 'Crear registro de oportunidades de automatización y priorizar por ROI.',
        },
        'D2 · Personas': {
            breach: 'Iniciativas de automatización en manos de Shadow IT, sin respaldo organizacional.',
            next: 'Formalizar al menos un rol de automatización en el organigrama.',
        },
        'D3 · Herramientas': {
            breach: 'Solo Excel y macros locales — sin plataforma RPA centralizada.',
            next: 'Piloto de RPA desktop en el proceso de mayor volumen repetitivo.',
        },
        'D4 · Tecnología': {
            breach: 'Automatización basada 100% en reglas rígidas (Si/Entonces), sin capacidad cognitiva.',
            next: 'Incorporar OCR/NLP básico para clasificación automática de documentos.',
        },
    },
    plm: {
        'D1 · Procesos': {
            breach: 'Gestión de cambios (ECO) por email — sin trazabilidad ni análisis de impacto.',
            next: 'Implementar flujo ECO formal con herramienta PLM básica.',
        },
        'D2 · Personas': {
            breach: 'Equipos trabajando en silos — sin visibilidad cruzada entre diseño y manufactura.',
            next: 'Crear comité transversal PLM con representantes de cada área.',
        },
        'D3 · Herramientas': {
            breach: 'Archivos CAD y BOM en discos locales — sin repositorio centralizado.',
            next: 'Implementar PDM/PLM básico como repositorio único de verdad.',
        },
        'D4 · Tecnología': {
            breach: 'Sistemas standalone sin integración — PLM, ERP y MES operan aislados.',
            next: 'Definir primera integración PLM-ERP para sincronización de BOM.',
        },
    },
};

const BREACH_OK = {
    breach: 'Nivel adecuado — procesos documentados y roles definidos para esta dimensión.',
    next: 'Mantener y medir. Próximo paso: escalar a nivel 4 — Gestionado.',
};

const INDUSTRY_LABELS: Record<string, string> = {
    construccion: 'Construcción e infraestructura',
    manufactura: 'Manufactura e industria',
    servicios: 'Servicios profesionales / BPO',
};

const EMPLOYEE_LABELS: Record<string, string> = {
    '1-10': '1 – 10 empleados',
    '11-50': '11 – 50 empleados',
    '51-200': '51 – 200 empleados',
    '201-500': '201 – 500 empleados',
    '501+': '501+ empleados',
};

// Question IDs mapped to dimensions per service
const DIM_MAP: Record<string, Record<string, string[]>> = {
    bim: {
        'D1 · Procesos': ['bim-proc-1', 'bim-proc-2'],
        'D2 · Personas': ['bim-pers-1', 'bim-pers-2'],
        'D3 · Herramientas': ['bim-herr-1', 'bim-herr-2'],
        'D4 · Tecnología': ['bim-tech-1', 'bim-tech-2'],
    },
    ia: {
        'D1 · Procesos': ['ia-proc-1', 'ia-proc-2'],
        'D2 · Personas': ['ia-pers-1', 'ia-pers-2'],
        'D3 · Herramientas': ['ia-herr-1', 'ia-herr-2'],
        'D4 · Tecnología': ['ia-tech-1', 'ia-tech-2'],
    },
    plm: {
        'D1 · Procesos': ['plm-proc-1', 'plm-proc-2'],
        'D2 · Personas': ['plm-pers-1', 'plm-pers-2'],
        'D3 · Herramientas': ['plm-herr-1', 'plm-herr-2'],
        'D4 · Tecnología': ['plm-tech-1', 'plm-tech-2'],
    },
};

const PRIORITY_LABELS: Record<string, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
};

export interface ReportData {
    company: string;
    industry: string;
    employees: string;
    goal: string;
    contact: string;
    date: string;
    services: Record<string, {
        score: number;
        prio: string;
        dims: Record<string, { score: number; breach: string; next: string }>;
    }>;
}

const DIM_KEY_TO_LABEL: Record<string, string> = {
    procesos: 'D1 · Procesos',
    personas: 'D2 · Personas',
    herramientas: 'D3 · Herramientas',
    tecnologia: 'D4 · Tecnología',
};

export function buildReportData(
    answers: AssessmentAnswers,
    precomputedScores?: ServiceScore[],
): ReportData {
    const { company, industry, employees, selectedServices } = answers.generalInfo;

    const services: ReportData['services'] = {};

    for (const svc of selectedServices) {
        const precomputed = precomputedScores?.find((s) => s.service === svc);

        const dims: Record<string, { score: number; breach: string; next: string }> = {};
        let serviceScore: number;

        if (precomputed) {
            serviceScore = precomputed.score;
            for (const [dimKey, dimLabel] of Object.entries(DIM_KEY_TO_LABEL)) {
                const dimScore = precomputed.dimensionScores[dimKey as keyof typeof precomputed.dimensionScores] || 0;
                const breachData = dimScore < 3
                    ? BREACH_TEXT[svc]?.[dimLabel] || BREACH_OK
                    : BREACH_OK;
                dims[dimLabel] = { score: dimScore || 1, breach: breachData.breach, next: breachData.next };
            }
        } else {
            const dimMap = DIM_MAP[svc];
            if (!dimMap) continue;

            let totalScore = 0;
            let totalDims = 0;

            for (const [dimName, questionIds] of Object.entries(dimMap)) {
                const values = questionIds
                    .map((id) => answers[svc]?.[id])
                    .filter((v): v is number => typeof v === 'number');

                const dimScore = values.length > 0
                    ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
                    : 1;

                const breachData = dimScore < 3
                    ? BREACH_TEXT[svc]?.[dimName] || BREACH_OK
                    : BREACH_OK;

                dims[dimName] = { score: dimScore, breach: breachData.breach, next: breachData.next };
                totalScore += dimScore;
                totalDims++;
            }

            serviceScore = totalDims > 0
                ? Math.round((totalScore / totalDims) * 10) / 10
                : 0;
        }

        services[svc] = {
            score: serviceScore,
            prio: PRIORITY_LABELS[answers.priorities[svc]] || 'Media',
            dims,
        };
    }

    return {
        company: company || 'Empresa',
        industry: INDUSTRY_LABELS[industry] || industry || 'No especificada',
        employees: EMPLOYEE_LABELS[employees] || employees || '',
        goal: answers.objective || '',
        contact: answers.contact?.email
            ? `${answers.contact.name || ''} — ${answers.contact.role || 'Contacto'}`
            : '',
        date: new Date().toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        services,
    };
}
