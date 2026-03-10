'use client';

import { ServiceScore } from '@/types/assessment';
import { getMaturityColor } from '@/lib/scoring';

interface PriorityRoadmapProps {
    roadmap: ServiceScore[];
    priorities: Record<string, string>;
}

export default function PriorityRoadmap({ roadmap, priorities }: PriorityRoadmapProps) {
    const priorityLabels: Record<string, string> = {
        baja: 'Baja',
        media: 'Media',
        alta: 'Alta',
        critica: 'Crítica',
    };

    return (
        <div className="bg-surface-white rounded-2xl border border-border-light p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">🗺️</span>
                <h3 className="font-syne font-bold text-lg text-foreground">Ruta de Prioridades</h3>
            </div>

            <p className="text-sm text-text-muted mb-6">
                Servicios ordenados por prioridad de intervención (menor madurez + mayor importancia
                estratégica).
            </p>

            <div className="space-y-4">
                {roadmap.map((service, idx) => {
                    const color = getMaturityColor(service.level);
                    const priority = priorityLabels[priorities[service.service]] || 'Media';

                    return (
                        <div
                            key={service.service}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border-light hover:shadow-md transition-all duration-200"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Priority number */}
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-syne font-bold text-white flex-shrink-0 ${idx === 0
                                        ? 'bg-urgency shadow-md shadow-urgency/20'
                                        : idx === 1
                                            ? 'bg-orange-400'
                                            : 'bg-text-muted'
                                    }`}
                            >
                                #{idx + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-foreground">{service.label}</p>
                                    <span
                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                        style={{ backgroundColor: `${color}15`, color }}
                                    >
                                        {service.score.toFixed(1)} — {service.level}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                    <span>Importancia declarada:</span>
                                    <span
                                        className={`font-medium ${priorities[service.service] === 'critica'
                                                ? 'text-urgency'
                                                : priorities[service.service] === 'alta'
                                                    ? 'text-orange-500'
                                                    : 'text-text-muted'
                                            }`}
                                    >
                                        {priority}
                                    </span>
                                </div>
                            </div>

                            {/* Arrow */}
                            {idx === 0 && (
                                <span className="text-urgency text-sm font-bold animate-pulse">
                                    ← Empezar aquí
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
