import {
    AssessmentAnswers,
    ServiceScore,
    ServiceType,
    MaturityLevel,
    PriorityLevel,
} from '@/types/assessment';

// ─── Maturity Level Mapping ────────────────────────────────────

export function getMaturityLevel(score: number): MaturityLevel {
    if (score < 1.5) return 'Inicial';
    if (score < 2.5) return 'Oportunista';
    if (score < 3.5) return 'Sistemático';
    if (score < 4.5) return 'Gestionado';
    return 'Optimizado';
}

export function getMaturityColor(level: MaturityLevel): string {
    switch (level) {
        case 'Inicial':
            return '#FF3D1F';
        case 'Oportunista':
            return '#FF8C1F';
        case 'Sistemático':
            return '#FFB81F';
        case 'Gestionado':
            return '#22C55E';
        case 'Optimizado':
            return '#1A1AFF';
    }
}

// ─── Score Calculation ─────────────────────────────────────────

type DimensionName = keyof ServiceScore['dimensionScores'];

const ID_DIM_KEYS: Record<string, DimensionName> = {
    proc: 'procesos',
    pers: 'personas',
    herr: 'herramientas',
    tech: 'tecnologia',
};

function resolveDimension(
    questionId: string,
    dimMap?: Record<string, string>
): DimensionName | null {
    if (dimMap?.[questionId]) {
        const dim = dimMap[questionId] as DimensionName;
        if (['procesos', 'personas', 'herramientas', 'tecnologia'].includes(dim)) return dim;
    }
    for (const [fragment, name] of Object.entries(ID_DIM_KEYS)) {
        if (questionId.includes(fragment)) return name;
    }
    return null;
}

function calculateServiceScore(
    answers: Record<string, number | string>,
    service: ServiceType,
    label: string,
    dimMap?: Record<string, string>
): ServiceScore {
    const numericAnswers = Object.entries(answers)
        .filter(([key, val]) => typeof val === 'number' && !key.includes('priority'))
        .map(([, val]) => val as number);

    const score =
        numericAnswers.length > 0
            ? numericAnswers.reduce((sum, v) => sum + v, 0) / numericAnswers.length
            : 0;

    const dimensionScores: ServiceScore['dimensionScores'] = {
        procesos: 0,
        personas: 0,
        herramientas: 0,
        tecnologia: 0,
    };

    const buckets: Record<DimensionName, number[]> = {
        procesos: [],
        personas: [],
        herramientas: [],
        tecnologia: [],
    };

    for (const [key, val] of Object.entries(answers)) {
        if (typeof val !== 'number' || key.includes('priority')) continue;
        const dim = resolveDimension(key, dimMap);
        if (dim) buckets[dim].push(val);
    }

    for (const dim of Object.keys(buckets) as DimensionName[]) {
        const arr = buckets[dim];
        if (arr.length > 0) {
            dimensionScores[dim] = Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10;
        }
    }

    return {
        service,
        label,
        score: Math.round(score * 10) / 10,
        level: getMaturityLevel(score),
        dimensionScores,
    };
}

const serviceLabels: Record<ServiceType, string> = {
    bim: 'BIM',
    ia: 'IA / RPA',
    plm: 'PLM',
};

export function calculateAllScores(
    answers: AssessmentAnswers,
    dimensionMaps?: Partial<Record<ServiceType, Record<string, string>>>
): {
    scores: ServiceScore[];
    globalScore: number;
    globalLevel: MaturityLevel;
    priorityRoadmap: ServiceScore[];
} {
    const selectedServices = answers.generalInfo.selectedServices || ['bim', 'ia', 'plm'];

    const scores: ServiceScore[] = selectedServices.map((svc) =>
        calculateServiceScore(answers[svc], svc, serviceLabels[svc], dimensionMaps?.[svc])
    );

    const validScores = scores.filter((s) => s.score > 0);
    const globalScore =
        validScores.length > 0
            ? Math.round(
                (validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length) * 10
            ) / 10
            : 0;

    const globalLevel = getMaturityLevel(globalScore);

    // Priority roadmap: sort by priority boost + low score
    const priorityBoost: Record<PriorityLevel, number> = {
        baja: 0,
        media: 0.5,
        alta: 1.0,
        critica: 1.5,
    };

    const priorityRoadmap = [...scores].sort((a, b) => {
        const boostA = priorityBoost[answers.priorities[a.service] || 'baja'];
        const boostB = priorityBoost[answers.priorities[b.service] || 'baja'];
        const priorityA = a.score - boostA;
        const priorityB = b.score - boostB;
        return priorityA - priorityB;
    });

    return { scores, globalScore, globalLevel, priorityRoadmap };
}
