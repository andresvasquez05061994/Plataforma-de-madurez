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
    const { scores, globalScore, globalLevel, priorityRoadmap, aiAnalysis, answers, setAiAnalysis, calculateResults } = useAssessmentStore();

    const [isAnalysisLoading, setIsAnalysisLoading] = useState(true);
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);
    const [calcError, setCalcError] = useState('');
    const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const selectedServices = answers.generalInfo.selectedServices;
    const serviceCount = scores.length;

    const buildFallbackAnalysis = () => {
        if (scores.length === 0) return '';
        const sorted = [...scores].sort((a, b) => a.score - b.score);
        const lowest = sorted[0];
        const highest = sorted[sorted.length - 1];
        return `## Resumen Ejecutivo\n\nLa organización ${answers.generalInfo.company || 'evaluada'} presenta un índice global de madurez digital de ${globalScore.toFixed(1)}/5.0. El principal foco de mejora está en ${lowest.label} (${lowest.score.toFixed(1)}/5.0), mientras que ${highest.label} muestra la mejor base actual (${highest.score.toFixed(1)}/5.0).\n\n## Top 3 Brechas Críticas\n\n1. **${lowest.label}**: menor nivel relativo de madurez.\n2. **Integración de procesos y herramientas**: existe oportunidad de estandarizar y conectar flujos.\n3. **Capacidades del equipo**: se requiere fortalecer adopción y disciplina operativa.\n\n## Roadmap de 90 días\n\n**Fase 1 (Semanas 1-4):** priorización de quick wins y KPIs.\n**Fase 2 (Semanas 5-8):** piloto enfocado en el frente más débil.\n**Fase 3 (Semanas 9-12):** escalamiento controlado y gobierno de mejora continua.\n\n## Próximo Paso Recomendado\n\nDefinir esta semana un plan táctico para ${lowest.label}, con responsables, métricas base y una iniciativa piloto de alto impacto.`;
    };

    useEffect(() => {
        if (scores.length === 0) calculateResults();
    }, [scores.length, calculateResults]);

    useEffect(() => {
        if (scores.length > 0) { setCalcError(''); return; }
        if (selectedServices.length === 0) {
            const t = setTimeout(() => setCalcError('No encontramos respuestas del diagnóstico para mostrar resultados.'), 1200);
            return () => clearTimeout(t);
        }
        const t = setTimeout(() => {
            if (useAssessmentStore.getState().scores.length === 0) setCalcError('No fue posible calcular los resultados. Puedes reintentar o volver al inicio.');
        }, 2000);
        return () => clearTimeout(t);
    }, [scores.length, selectedServices.length]);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (aiAnalysis) { setIsAnalysisLoading(false); return; }
            try {
                const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers, scores, globalScore }) });
                if (res.ok) {
                    const data = await res.json();
                    setAiAnalysis(data.analysis || buildFallbackAnalysis());
                } else {
                    setAiAnalysis(buildFallbackAnalysis());
                }
            } catch { setAiAnalysis(buildFallbackAnalysis()); }
            finally { setIsAnalysisLoading(false); }
        };
        if (scores.length > 0) fetchAnalysis();
    }, [scores, answers, globalScore, aiAnalysis, setAiAnalysis]);

    const handleDownloadPDF = async () => {
        setIsPdfGenerating(true);
        const win = window.open('', '_blank');
        try {
            const res = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers, scores }) });
            if (!res.ok) throw new Error('Report API error');
            const html = await res.text();
            if (win) {
                win.document.write(html);
                win.document.close();
            } else {
                const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `Diagnostico-${answers.generalInfo.company || 'Empresa'}.html`;
                a.click();
                URL.revokeObjectURL(a.href);
            }
        } catch {
            if (win) win.close();
            alert('Error al generar el reporte. Intenta de nuevo.');
        } finally { setIsPdfGenerating(false); }
    };

    const handleSendEmail = async () => {
        const email = answers.contact?.email;
        if (!email) { alert('No se encontró un correo electrónico. Completa el formulario de contacto.'); return; }
        setEmailStatus('sending');
        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: answers.contact?.name || '',
                    email,
                    company: answers.generalInfo.company,
                    services: scores.map(s => s.label),
                    answers,
                    scores,
                }),
            });
            if (res.ok) {
                setEmailStatus('sent');
            } else {
                const data = await res.json().catch(() => ({}));
                console.error('Email API error:', data);
                setEmailStatus('error');
            }
        } catch { setEmailStatus('error'); }
    };

    const emailBtnLabel = emailStatus === 'sending' ? 'Enviando...' : emailStatus === 'sent' ? '✓ Enviado' : emailStatus === 'error' ? 'Error — Reintentar' : '✉️ Enviar a mi correo';

    if (scores.length === 0) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-surface-alt rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-2xl">📊</span>
                    </div>
                    <h2 className="font-syne font-bold text-xl text-foreground mb-2">Calculando resultados...</h2>
                    {!calcError && <p className="text-muted text-sm">Un momento por favor</p>}
                    {calcError && (
                        <div className="mt-4 max-w-md">
                            <p className="text-sm text-urgency mb-3">{calcError}</p>
                            <div className="flex gap-2 justify-center">
                                <button onClick={() => { setCalcError(''); calculateResults(); }} className="px-4 py-2 rounded-2xl text-sm font-medium bg-foreground text-white hover:opacity-90 transition-all">Reintentar</button>
                                <button onClick={() => router.push('/')} className="px-4 py-2 rounded-2xl text-sm font-medium bg-surface-alt text-foreground hover:bg-border transition-all">Volver al inicio</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        );
    }

    const renderSingleService = () => {
        const score = scores[0];
        const color = getMaturityColor(score.level);
        return (
            <div className="bg-surface rounded-3xl border border-border p-8 sm:p-10 mb-8 shadow-card animate-slide-up">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0"><MaturityBadge level={score.level} score={score.score} /></div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground mb-2">Evaluación {score.label}</h2>
                        <p className="text-muted text-sm sm:text-base mb-6 max-w-md">
                            Tu organización se encuentra en nivel <span className="font-bold" style={{ color }}>{score.level}</span> con un puntaje de {score.score.toFixed(1)} sobre 5.0
                        </p>
                        <DimensionBreakdown dimensions={score.dimensionScores} service={score.service} />
                    </div>
                </div>
            </div>
        );
    };

    const renderTwoServices = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {scores.map((score, idx) => (
                    <div key={score.service} className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card animate-slide-up" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className="text-center mb-6"><MaturityBadge level={score.level} score={score.score} /></div>
                        <h3 className="font-syne font-bold text-lg text-center text-foreground mb-4">{score.label}</h3>
                        <DimensionBreakdown dimensions={score.dimensionScores} service={score.service} compact />
                    </div>
                ))}
            </div>
            <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 mb-8 shadow-card animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0"><MaturityBadge level={globalLevel} score={globalScore} /></div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-muted text-sm mb-1">Índice Global de Madurez</p>
                        <h3 className="font-syne font-bold text-xl text-foreground mb-4">Comparativa de Servicios</h3>
                        <div className="space-y-4">{scores.map((s, i) => <ScoreBar key={s.service} label={s.label} score={s.score} level={s.level} delay={i * 200} />)}</div>
                    </div>
                </div>
            </div>
        </>
    );

    const renderThreeServices = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 flex flex-col items-center justify-center shadow-card animate-slide-up">
                    <p className="text-muted text-sm mb-4 font-medium">Índice Global de Madurez</p>
                    <MaturityBadge level={globalLevel} score={globalScore} />
                </div>
                <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-card animate-slide-up" style={{ animationDelay: '150ms' }}>
                    <p className="text-muted text-sm mb-4 font-medium text-center">Perfil de Madurez</p>
                    <RadarChart scores={scores} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {scores.map((score, idx) => (
                    <div key={score.service} className="bg-surface rounded-3xl border border-border p-6 shadow-card animate-slide-up" style={{ animationDelay: `${(idx + 2) * 150}ms` }}>
                        <div className="text-center mb-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${getMaturityColor(score.level)}10` }}>
                                <span className="font-syne font-extrabold text-xl" style={{ color: getMaturityColor(score.level) }}>{score.score.toFixed(1)}</span>
                            </div>
                            <h3 className="font-syne font-bold text-base text-foreground">{score.label}</h3>
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: `${getMaturityColor(score.level)}15`, color: getMaturityColor(score.level) }}>{score.level}</span>
                        </div>
                        <DimensionBreakdown dimensions={score.dimensionScores} service={score.service} compact />
                    </div>
                ))}
            </div>
            <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 mb-8 shadow-card animate-slide-up" style={{ animationDelay: '600ms' }}>
                <h3 className="font-syne font-bold text-lg text-foreground mb-6">Madurez por Servicio</h3>
                <div className="space-y-6">{scores.map((s, i) => <ScoreBar key={s.service} label={s.label} score={s.score} level={s.level} delay={i * 200} />)}</div>
            </div>
        </>
    );

    return (
        <main className="min-h-screen bg-background">
            <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <IACLogo size="sm" />
                        <p className="text-xs text-muted">Resultados del diagnóstico</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleSendEmail} disabled={emailStatus === 'sending'} className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all disabled:opacity-50 ${emailStatus === 'sent' ? 'bg-success text-white' : emailStatus === 'error' ? 'bg-urgency text-white' : 'bg-surface border border-border text-foreground hover:bg-surface-alt'}`}>
                            {emailBtnLabel}
                        </button>
                        <button onClick={handleDownloadPDF} disabled={isPdfGenerating} className="px-4 py-2 rounded-2xl text-sm font-medium bg-foreground text-white hover:opacity-90 transition-all disabled:opacity-50">
                            {isPdfGenerating ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-30"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                                    Generando...
                                </span>
                            ) : '📄 Descargar PDF'}
                        </button>
                        <a href="mailto:info@iac.com.co?subject=Consultoría Diagnóstico de Madurez Digital" className="hidden sm:inline-flex px-4 py-2 rounded-2xl text-sm font-medium bg-accent text-navy-800 hover:bg-accent-hover transition-all shadow-gold">
                            📅 Agendar consultoría
                        </a>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="mb-8 animate-fade-in">
                    <p className="text-muted text-sm">Diagnóstico para</p>
                    <h1 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground mb-2">{answers.generalInfo.company}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-light">Servicios evaluados:</span>
                        {scores.map((s) => (
                            <span key={s.service} className="text-xs font-medium bg-accent/15 text-navy-600 px-2.5 py-1 rounded-full">{s.label}</span>
                        ))}
                    </div>
                </div>

                {serviceCount === 1 && renderSingleService()}
                {serviceCount === 2 && renderTwoServices()}
                {serviceCount >= 3 && renderThreeServices()}

                {serviceCount >= 2 && (
                    <div className="mb-8"><PriorityRoadmap roadmap={priorityRoadmap} priorities={answers.priorities as Record<string, string>} /></div>
                )}

                <div className="mb-8"><AnalysisSection analysis={aiAnalysis} isLoading={isAnalysisLoading} /></div>

                <div className="bg-navy-600 rounded-3xl p-8 sm:p-10 text-center mb-8 animate-slide-up">
                    <h3 className="font-syne font-bold text-xl sm:text-2xl text-white mb-3">¿Listo para acelerar tu transformación?</h3>
                    <p className="text-navy-200 text-sm sm:text-base mb-6 max-w-lg mx-auto">
                        Nuestro equipo de consultores puede ayudarte a implementar un roadmap personalizado basado en estos resultados.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="mailto:info@iac.com.co?subject=Consultoría Diagnóstico de Madurez Digital" className="px-6 py-3 bg-accent text-navy-800 font-syne font-bold rounded-2xl hover:bg-accent-hover transition-all shadow-gold">
                            Agendar consultoría gratuita
                        </a>
                        <button onClick={handleSendEmail} disabled={emailStatus === 'sending'} className={`px-6 py-3 font-medium rounded-2xl transition-all border ${emailStatus === 'sent' ? 'bg-success text-white border-success' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}>
                            {emailBtnLabel}
                        </button>
                        <button onClick={handleDownloadPDF} className="px-6 py-3 bg-white/10 text-white font-medium rounded-2xl hover:bg-white/20 transition-all border border-white/20">
                            📄 Descargar reporte completo
                        </button>
                    </div>
                    <p className="text-navy-300 text-[10px] mt-6 italic">Ingeniería Asistida por Computador — 30 años elevando la eficiencia de los negocios</p>
                </div>
            </div>
        </main>
    );
}
