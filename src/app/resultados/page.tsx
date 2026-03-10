'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/assessment-store';
import ScoreBar from '@/components/results/ScoreBar';
import MaturityBadge from '@/components/results/MaturityBadge';
import RadarChart from '@/components/results/RadarChart';
import PriorityRoadmap from '@/components/results/PriorityRoadmap';
import AnalysisSection from '@/components/results/AnalysisSection';
import DimensionBreakdown from '@/components/results/DimensionBreakdown';
import IACLogo from '@/components/brand/IACLogo';
import { getMaturityColor } from '@/lib/scoring';

export default function ResultadosPage() {
    const router = useRouter();
    const {
        scores,
        globalScore,
        globalLevel,
        priorityRoadmap,
        aiAnalysis,
        answers,
        setAiAnalysis,
        calculateResults,
    } = useAssessmentStore();

    const [isAnalysisLoading, setIsAnalysisLoading] = useState(true);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
    const [calcError, setCalcError] = useState('');

    const selectedServices = answers.generalInfo.selectedServices;
    const serviceCount = scores.length;

    const buildFallbackAnalysis = () => {
        if (scores.length === 0) return '';
        const sorted = [...scores].sort((a, b) => a.score - b.score);
        const lowest = sorted[0];
        const highest = sorted[sorted.length - 1];

        return `## Resumen Ejecutivo

La organización ${answers.generalInfo.company || 'evaluada'} presenta un índice global de madurez digital de ${globalScore.toFixed(1)}/5.0. El principal foco de mejora está en ${lowest.label} (${lowest.score.toFixed(1)}/5.0), mientras que ${highest.label} muestra la mejor base actual (${highest.score.toFixed(1)}/5.0).

## Top 3 Brechas Críticas

1. **${lowest.label}**: menor nivel relativo de madurez.
2. **Integración de procesos y herramientas**: existe oportunidad de estandarizar y conectar flujos.
3. **Capacidades del equipo**: se requiere fortalecer adopción y disciplina operativa.

## Roadmap de 90 días

**Fase 1 (Semanas 1-4):** priorización de quick wins y KPIs.
**Fase 2 (Semanas 5-8):** piloto enfocado en el frente más débil.
**Fase 3 (Semanas 9-12):** escalamiento controlado y gobierno de mejora continua.

## Próximo Paso Recomendado

Definir esta semana un plan táctico para ${lowest.label}, con responsables, métricas base y una iniciativa piloto de alto impacto.`;
    };

    // Recalculate if coming directly
    useEffect(() => {
        if (scores.length === 0) {
            calculateResults();
        }
    }, [scores.length, calculateResults]);

    // Prevent endless loading when there is no assessment state available
    useEffect(() => {
        if (scores.length > 0) {
            setCalcError('');
            return;
        }

        if (selectedServices.length === 0) {
            const timer = setTimeout(() => {
                setCalcError('No encontramos respuestas del diagnóstico para mostrar resultados.');
            }, 1200);
            return () => clearTimeout(timer);
        }

        const timer = setTimeout(() => {
            if (useAssessmentStore.getState().scores.length === 0) {
                setCalcError('No fue posible calcular los resultados. Puedes reintentar o volver al inicio.');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [scores.length, selectedServices.length]);

    // Fetch AI analysis
    useEffect(() => {
        const fetchAnalysis = async () => {
            if (aiAnalysis) {
                setIsAnalysisLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        answers,
                        scores,
                        globalScore,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.analysis) {
                        setAiAnalysis(data.analysis);
                    } else {
                        setAiAnalysis(buildFallbackAnalysis());
                    }
                } else {
                    console.error('Analysis API error:', response.status);
                    setAiAnalysis(buildFallbackAnalysis());
                }
            } catch (error) {
                console.error('Failed to fetch analysis:', error);
                setAiAnalysis(buildFallbackAnalysis());
            } finally {
                setIsAnalysisLoading(false);
            }
        };

        if (scores.length > 0) {
            fetchAnalysis();
        }
    }, [scores, answers, globalScore, aiAnalysis, setAiAnalysis]);

    // Handle report download (HTML → print to PDF)
    const handleDownloadPDF = async () => {
        setIsPdfGenerating(true);
        try {
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });

            if (!response.ok) throw new Error('Report API error');

            const html = await response.text();
            const win = window.open('', '_blank');
            if (win) {
                win.document.write(html);
                win.document.close();
            } else {
                alert('Permite ventanas emergentes para descargar el reporte.');
            }
        } catch (error) {
            console.error('Report generation failed:', error);
            alert('Error al generar el reporte. Intenta de nuevo.');
        } finally {
            setIsPdfGenerating(false);
        }
    };

    if (scores.length === 0) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-2xl">📊</span>
                    </div>
                    <h2 className="font-syne font-bold text-xl text-foreground mb-2">
                        Calculando resultados...
                    </h2>
                    {!calcError && <p className="text-text-muted text-sm">Un momento por favor</p>}
                    {calcError && (
                        <div className="mt-4 max-w-md">
                            <p className="text-sm text-urgency mb-3">{calcError}</p>
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => {
                                        setCalcError('');
                                        calculateResults();
                                    }}
                                    className="px-4 py-2 rounded-xl text-sm font-medium bg-foreground text-white hover:bg-foreground/90 transition-all"
                                >
                                    Reintentar
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="px-4 py-2 rounded-xl text-sm font-medium bg-surface-muted text-foreground hover:bg-border-light transition-all"
                                >
                                    Volver al inicio
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        );
    }

    // ── Adaptive Dashboard Layouts ──

    // Single service: Hero card with 4-dimension breakdown
    const renderSingleService = () => {
        const score = scores[0];
        const color = getMaturityColor(score.level);

        return (
            <>
                {/* Hero Card */}
                <div className="bg-surface-white rounded-2xl border border-border-light p-8 sm:p-10 mb-8 animate-slide-up">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Score Badge */}
                        <div className="flex-shrink-0">
                            <MaturityBadge level={score.level} score={score.score} />
                        </div>

                        {/* Details */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground mb-2">
                                Evaluación {score.label}
                            </h2>
                            <p className="text-text-muted text-sm sm:text-base mb-6 max-w-md">
                                Tu organización se encuentra en nivel{' '}
                                <span className="font-bold" style={{ color }}>{score.level}</span>{' '}
                                con un puntaje de {score.score.toFixed(1)} sobre 5.0
                            </p>

                            {/* 4-Dimension breakdown */}
                            <DimensionBreakdown dimensions={score.dimensionScores} service={score.service} />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // Two services: 2-column grid with comparative roadmap
    const renderTwoServices = () => (
        <>
            {/* 2 Column score cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {scores.map((score, idx) => {
                    const color = getMaturityColor(score.level);
                    return (
                        <div
                            key={score.service}
                            className="bg-surface-white rounded-2xl border border-border-light p-6 sm:p-8 animate-slide-up"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="text-center mb-6">
                                <MaturityBadge level={score.level} score={score.score} />
                            </div>
                            <h3 className="font-syne font-bold text-lg text-center text-foreground mb-4">
                                {score.label}
                            </h3>
                            <DimensionBreakdown dimensions={score.dimensionScores} service={score.service} compact />
                        </div>
                    );
                })}
            </div>

            {/* Global combined */}
            <div className="bg-surface-white rounded-2xl border border-border-light p-6 sm:p-8 mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                        <MaturityBadge level={globalLevel} score={globalScore} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-text-muted text-sm mb-1">Índice Global de Madurez</p>
                        <h3 className="font-syne font-bold text-xl text-foreground mb-2">
                            Comparativa de Servicios
                        </h3>
                        <div className="space-y-4 mt-4">
                            {scores.map((score, idx) => (
                                <ScoreBar
                                    key={score.service}
                                    label={score.label}
                                    score={score.score}
                                    level={score.level}
                                    delay={idx * 200}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // Three services: 3-column grid with spider chart
    const renderThreeServices = () => (
        <>
            {/* Global Score + Spider Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Global Score */}
                <div className="bg-surface-white rounded-2xl border border-border-light p-6 sm:p-8 flex flex-col items-center justify-center animate-slide-up">
                    <p className="text-text-muted text-sm mb-4 font-medium">Índice Global de Madurez</p>
                    <MaturityBadge level={globalLevel} score={globalScore} />
                </div>

                {/* Spider/Radar Chart */}
                <div className="bg-surface-white rounded-2xl border border-border-light p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
                    <p className="text-text-muted text-sm mb-4 font-medium text-center">
                        Perfil de Madurez
                    </p>
                    <RadarChart scores={scores} />
                </div>
            </div>

            {/* 3 Column service cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {scores.map((score, idx) => (
                    <div
                        key={score.service}
                        className="bg-surface-white rounded-2xl border border-border-light p-6 animate-slide-up"
                        style={{ animationDelay: `${(idx + 2) * 150}ms` }}
                    >
                        <div className="text-center mb-4">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                style={{ backgroundColor: `${getMaturityColor(score.level)}10` }}
                            >
                                <span className="font-syne font-extrabold text-xl" style={{ color: getMaturityColor(score.level) }}>
                                    {score.score.toFixed(1)}
                                </span>
                            </div>
                            <h3 className="font-syne font-bold text-base text-foreground">{score.label}</h3>
                            <span
                                className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1"
                                style={{
                                    backgroundColor: `${getMaturityColor(score.level)}15`,
                                    color: getMaturityColor(score.level),
                                }}
                            >
                                {score.level}
                            </span>
                        </div>
                        <DimensionBreakdown dimensions={score.dimensionScores} service={score.service} compact />
                    </div>
                ))}
            </div>

            {/* Score Bars */}
            <div className="bg-surface-white rounded-2xl border border-border-light p-6 sm:p-8 mb-8 animate-slide-up" style={{ animationDelay: '600ms' }}>
                <h3 className="font-syne font-bold text-lg text-foreground mb-6">
                    Madurez por Servicio
                </h3>
                <div className="space-y-6">
                    {scores.map((score, idx) => (
                        <ScoreBar
                            key={score.service}
                            label={score.label}
                            score={score.score}
                            level={score.level}
                            delay={idx * 200}
                        />
                    ))}
                </div>
            </div>
        </>
    );

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border-light bg-surface-white/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <IACLogo size="sm" />
                        <div>
                            <p className="text-xs text-text-muted">Resultados del diagnóstico</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isPdfGenerating}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-foreground text-white hover:bg-foreground/90 transition-all disabled:opacity-50"
                        >
                            {isPdfGenerating ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-30" />
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    Generando...
                                </span>
                            ) : (
                                '📄 Descargar PDF'
                            )}
                        </button>
                        <a
                            href="mailto:info@iac.com.co?subject=Consultoría Diagnóstico de Madurez Digital"
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-accent text-white hover:bg-accent-dark transition-all shadow-md shadow-accent/20"
                        >
                            📅 Agendar consultoría
                        </a>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Company name & services evaluated */}
                <div className="mb-8 animate-fade-in">
                    <p className="text-text-muted text-sm">Diagnóstico para</p>
                    <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground mb-2">
                        {answers.generalInfo.company}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-text-light">Servicios evaluados:</span>
                        {scores.map((s) => (
                            <span
                                key={s.service}
                                className="text-xs font-medium bg-accent/10 text-accent px-2.5 py-1 rounded-full"
                            >
                                {s.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Adaptive Layout ── */}
                {serviceCount === 1 && renderSingleService()}
                {serviceCount === 2 && renderTwoServices()}
                {serviceCount >= 3 && renderThreeServices()}

                {/* Priority Roadmap (only for 2+ services) */}
                {serviceCount >= 2 && (
                    <div className="mb-8">
                        <PriorityRoadmap
                            roadmap={priorityRoadmap}
                            priorities={answers.priorities as Record<string, string>}
                        />
                    </div>
                )}

                {/* AI Analysis */}
                <div className="mb-8">
                    <AnalysisSection analysis={aiAnalysis} isLoading={isAnalysisLoading} />
                </div>

                {/* CTA Footer */}
                <div className="bg-accent rounded-2xl p-8 sm:p-10 text-center mb-8 animate-slide-up">
                    <h3 className="font-syne font-bold text-xl sm:text-2xl text-white mb-3">
                        ¿Listo para acelerar tu transformación?
                    </h3>
                    <p className="text-white/80 text-sm sm:text-base mb-6 max-w-lg mx-auto">
                        Nuestro equipo de consultores puede ayudarte a implementar un roadmap
                        personalizado basado en estos resultados.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="mailto:info@iac.com.co?subject=Consultoría Diagnóstico de Madurez Digital"
                            className="px-6 py-3 bg-white text-accent font-syne font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg"
                        >
                            Agendar consultoría gratuita
                        </a>
                        <button
                            onClick={handleDownloadPDF}
                            className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all border border-white/20"
                        >
                            📄 Descargar reporte completo
                        </button>
                    </div>
                    <p className="text-white/50 text-[10px] mt-6 italic">
                        Ingeniería Asistida por Computador — 30 años elevando la eficiencia de los negocios
                    </p>
                </div>
            </div>
        </main>
    );
}
