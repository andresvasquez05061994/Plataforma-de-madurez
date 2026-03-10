'use client';

import { useEffect, useState } from 'react';
import { AssessmentRow } from '@/types/assessment';
import { getMaturityColor } from '@/lib/scoring';

export default function AdminPage() {
    const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            const res = await fetch('/api/assessment');
            if (!res.ok) throw new Error('Error al cargar');
            const data = await res.json();
            setAssessments(data.assessments || []);
        } catch (err) {
            setError('No se pudieron cargar los diagnósticos. Verifica la conexión a Supabase.');
        } finally {
            setLoading(false);
        }
    };

    const selectedAssessment = assessments.find((a) => a.id === selectedId);

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border-light bg-surface-white/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center">
                            <span className="text-white font-syne font-bold text-sm">M</span>
                        </div>
                        <div>
                            <span className="font-syne font-bold text-foreground">MaturityOS</span>
                            <p className="text-xs text-text-muted">Panel de Administración</p>
                        </div>
                    </div>
                    <span className="text-sm text-text-muted">
                        {assessments.length} diagnóstico{assessments.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-20 w-full rounded-xl" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <p className="text-text-muted mb-2">{error}</p>
                        <button
                            onClick={fetchAssessments}
                            className="text-accent text-sm font-medium hover:underline"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : assessments.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <h2 className="font-syne font-bold text-xl text-foreground mb-2">
                            Sin diagnósticos aún
                        </h2>
                        <p className="text-text-muted text-sm">
                            Los diagnósticos completados aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* List */}
                        <div className="lg:col-span-1 space-y-3">
                            <h2 className="font-syne font-bold text-lg text-foreground mb-4">
                                Diagnósticos
                            </h2>
                            {assessments.map((a) => {
                                const isActive = selectedId === a.id;
                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelectedId(a.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${isActive
                                                ? 'border-accent bg-accent/5 shadow-md'
                                                : 'border-border-light bg-surface-white hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-semibold text-foreground text-sm truncate">
                                                {a.company || 'Sin nombre'}
                                            </p>
                                            <span
                                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                style={{
                                                    backgroundColor: `${getMaturityColor(a.global_level)}15`,
                                                    color: getMaturityColor(a.global_level),
                                                }}
                                            >
                                                {a.global_score?.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                            <span>{a.industry}</span>
                                            <span>·</span>
                                            <span>{new Date(a.created_at).toLocaleDateString('es-CO')}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Detail */}
                        <div className="lg:col-span-2">
                            {selectedAssessment ? (
                                <div className="bg-surface-white rounded-2xl border border-border-light p-6 sm:p-8 animate-fade-in">
                                    <h2 className="font-syne font-bold text-xl text-foreground mb-1">
                                        {selectedAssessment.company}
                                    </h2>
                                    <p className="text-sm text-text-muted mb-6">
                                        {selectedAssessment.industry} · {selectedAssessment.answers?.generalInfo?.employees || '—'} empleados ·{' '}
                                        {new Date(selectedAssessment.created_at).toLocaleDateString('es-CO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>

                                    {/* Scores */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        {selectedAssessment.scores?.map((s: any) => (
                                            <div
                                                key={s.service}
                                                className="p-4 rounded-xl border border-border-light text-center"
                                            >
                                                <p className="text-xs text-text-muted mb-1">{s.label}</p>
                                                <p
                                                    className="text-2xl font-syne font-bold"
                                                    style={{ color: getMaturityColor(s.level) }}
                                                >
                                                    {s.score?.toFixed(1)}
                                                </p>
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{
                                                        backgroundColor: `${getMaturityColor(s.level)}15`,
                                                        color: getMaturityColor(s.level),
                                                    }}
                                                >
                                                    {s.level}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Global score */}
                                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 text-center mb-6">
                                        <p className="text-sm text-text-muted mb-1">Score Global</p>
                                        <p className="text-3xl font-syne font-bold text-accent">
                                            {selectedAssessment.global_score?.toFixed(1)}
                                        </p>
                                        <p className="text-sm text-accent">{selectedAssessment.global_level}</p>
                                    </div>

                                    {/* Contact */}
                                    {selectedAssessment.contact_name && (
                                        <div className="p-4 rounded-xl border border-border-light mb-6">
                                            <h4 className="font-semibold text-sm text-foreground mb-2">Contacto</h4>
                                            <p className="text-sm text-text-muted">
                                                {selectedAssessment.contact_name} · {selectedAssessment.contact_email}
                                                {selectedAssessment.contact_role &&
                                                    ` · ${selectedAssessment.contact_role}`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Objective */}
                                    {selectedAssessment.objective && (
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-sm text-foreground mb-2">
                                                Objetivo de transformación
                                            </h4>
                                            <p className="text-sm text-text-muted">
                                                {selectedAssessment.objective}
                                            </p>
                                        </div>
                                    )}

                                    {/* AI Analysis */}
                                    {selectedAssessment.ai_analysis && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-foreground mb-2">
                                                Análisis IA
                                            </h4>
                                            <div className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                                                {selectedAssessment.ai_analysis}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-text-muted text-sm">
                                    Selecciona un diagnóstico para ver el detalle
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
