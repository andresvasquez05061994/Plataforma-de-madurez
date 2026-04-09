import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { answers, scores, globalScore } = body;

        const apiKey = process.env.OPENAI_API_KEY;
        let analysis = '';

        if (!apiKey) {
            analysis = generateFallbackAnalysis(answers, scores, globalScore);
        } else {
            const assessmentContext = buildAssessmentContext(answers, scores, globalScore);

            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        max_tokens: 2000,
                        messages: [
                            {
                                role: 'system',
                                content: `Eres consultor senior en transformación digital industrial.
Analiza el diagnóstico de madurez y genera en español:
1. Resumen ejecutivo (2 párrafos, tono ejecutivo orientado a ROI)
2. Top 3 brechas críticas identificadas
3. Roadmap de 90 días con 3 fases concretas
4. Próximo paso recomendado (accionable esta semana)
Tono: directo, concreto, con métricas cuando sea posible.`,
                            },
                            {
                                role: 'user',
                                content: assessmentContext,
                            },
                        ],
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('OpenAI API error:', response.status, errorText);
                    analysis = generateFallbackAnalysis(answers, scores, globalScore);
                } else {
                    const data = await response.json();
                    analysis = data.choices?.[0]?.message?.content || generateFallbackAnalysis(answers, scores, globalScore);
                }
            } catch (aiErr) {
                console.error('OpenAI fetch error:', aiErr);
                analysis = generateFallbackAnalysis(answers, scores, globalScore);
            }
        }

        try {
            await saveToSupabase(answers, scores, globalScore, analysis);
        } catch (dbError) {
            console.error('Supabase save error:', dbError);
        }

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error('Analyze API error:', error);
        return NextResponse.json(
            { error: 'Error al procesar el análisis' },
            { status: 500 }
        );
    }
}

function buildAssessmentContext(answers: any, scores: any, globalScore: number): string {
    const lines: string[] = [
        `## Datos del diagnóstico de madurez digital`,
        ``,
        `**Empresa:** ${answers.generalInfo?.company || 'No especificada'}`,
        `**Industria:** ${answers.generalInfo?.industry || 'No especificada'}`,
        `**Servicios evaluados:** ${(answers.generalInfo?.selectedServices || []).join(', ').toUpperCase() || 'No especificados'}`,
        ``,
        `## Scores de Madurez (escala 1-5)`,
        ``,
    ];

    for (const score of scores) {
        lines.push(`- **${score.label}:** ${score.score.toFixed(1)} (${score.level})`);
        if (score.dimensionScores) {
            lines.push(`  - Procesos: ${score.dimensionScores.procesos?.toFixed(1) || 'N/A'}`);
            lines.push(`  - Personas: ${score.dimensionScores.personas?.toFixed(1) || 'N/A'}`);
            lines.push(`  - Herramientas: ${score.dimensionScores.herramientas?.toFixed(1) || 'N/A'}`);
            lines.push(`  - Tecnología: ${score.dimensionScores.tecnologia?.toFixed(1) || 'N/A'}`);
        }
    }

    lines.push(``);
    lines.push(`**Score global:** ${globalScore.toFixed(1)}`);
    lines.push(``);

    if (answers.priorities) {
        const selected = answers.generalInfo?.selectedServices || ['bim', 'ia', 'plm'];
        lines.push(`## Prioridades declaradas`);
        if (selected.includes('bim')) lines.push(`- BIM: ${answers.priorities.bim || 'media'}`);
        if (selected.includes('ia')) lines.push(`- IA/RPA: ${answers.priorities.ia || 'media'}`);
        if (selected.includes('plm')) lines.push(`- PLM: ${answers.priorities.plm || 'media'}`);
        lines.push(``);
    }

    if (answers.objective) {
        lines.push(`## Objetivo de transformación`);
        lines.push(answers.objective);
        lines.push(``);
    }

    return lines.join('\n');
}

function generateFallbackAnalysis(answers: any, scores: any, globalScore: number): string {
    const lowestScore = scores.reduce((min: any, s: any) =>
        s.score < min.score ? s : min, scores[0]);
    const highestScore = scores.reduce((max: any, s: any) =>
        s.score > max.score ? s : max, scores[0]);

    return `## Resumen Ejecutivo

La organización ${answers.generalInfo?.company || ''} presenta un índice global de madurez digital de ${globalScore.toFixed(1)}/5.0. Este resultado indica que la empresa se encuentra en una etapa de transición con oportunidades significativas de mejora, particularmente en ${lowestScore?.label || 'áreas clave'} donde se registró el score más bajo (${lowestScore?.score?.toFixed(1) || 'N/A'}).

El área de mayor fortaleza es ${highestScore?.label || 'N/A'} con un score de ${highestScore?.score?.toFixed(1) || 'N/A'}, lo cual representa una base sólida sobre la cual construir la estrategia de transformación digital.

## Top 3 Brechas Críticas

1. **${lowestScore?.label || 'Área prioritaria'}** (${lowestScore?.score?.toFixed(1) || 'N/A'}/5.0) — Requiere intervención inmediata para nivelar las capacidades digitales de la organización.
2. **Integración entre sistemas** — Se identifican oportunidades para mejorar la interoperabilidad entre las diferentes plataformas tecnológicas.
3. **Capacitación del personal** — Es necesario fortalecer las competencias digitales del equipo para maximizar el retorno de la inversión tecnológica.

## Roadmap de 90 días

**Fase 1 (Semanas 1-4): Diagnóstico profundo y Quick Wins**
- Auditoría detallada de procesos en ${lowestScore?.label || 'el área más crítica'}
- Identificación de 3-5 procesos para automatización rápida
- Definición del equipo de transformación digital

**Fase 2 (Semanas 5-8): Implementación piloto**
- Despliegue de solución piloto en el proceso de mayor impacto
- Capacitación del equipo core en nuevas herramientas
- Establecimiento de KPIs y métricas de seguimiento

**Fase 3 (Semanas 9-12): Escalamiento y medición**
- Evaluación de resultados del piloto
- Plan de escalamiento a otros procesos
- Definición del roadmap a 12 meses

## Próximo Paso Recomendado

Agendar una sesión de consultoría estratégica con el equipo de IAC para realizar un diagnóstico profundo de las brechas identificadas y definir los quick wins que se pueden implementar esta misma semana. Se recomienda iniciar con una evaluación detallada del área de ${lowestScore?.label || 'mayor brecha'}.`;
}

async function saveToSupabase(
    answers: any,
    scores: any,
    globalScore: number,
    analysis: string
) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured — skipping save. URL:', !!supabaseUrl, 'KEY:', !!supabaseKey);
        return;
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const getLevel = (score: number) => {
        if (score < 1.5) return 'Inicial';
        if (score < 2.5) return 'Oportunista';
        if (score < 3.5) return 'Sistemático';
        if (score < 4.5) return 'Gestionado';
        return 'Optimizado';
    };

    const { error } = await supabase.from('assessments').insert({
        company: answers.generalInfo?.company || '',
        industry: answers.generalInfo?.industry || '',
        selected_services: answers.generalInfo?.selectedServices || [],
        answers,
        scores,
        global_score: globalScore,
        global_level: getLevel(globalScore),
        ai_analysis: analysis,
        contact_name: answers.contact?.name || '',
        contact_email: answers.contact?.email || '',
        contact_role: answers.contact?.role || '',
        objective: answers.objective || '',
    });

    if (error) {
        console.error('Supabase INSERT error:', error.message, error.details, error.hint);
        throw new Error(`Supabase: ${error.message}`);
    }
    console.log('Assessment saved to Supabase successfully');
}
