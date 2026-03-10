'use client';

import { useState } from 'react';

interface HelpTooltipProps {
    text: string;
}

export default function HelpTooltip({ text }: HelpTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-border-light text-text-light hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-200 text-xs font-bold"
                aria-label="Ayuda"
            >
                ?
            </button>

            {/* Side panel overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-surface-white shadow-2xl z-50 animate-slide-in-right overflow-y-auto">
                        <div className="p-6 sm:p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent text-sm">
                                        💡
                                    </span>
                                    <h3 className="font-syne font-bold text-foreground">¿Qué significa esto?</h3>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg hover:bg-surface-muted transition-colors text-text-muted"
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="prose prose-sm">
                                <p className="text-text-muted leading-relaxed text-[15px]">{text}</p>
                            </div>

                            {/* Tip */}
                            <div className="mt-6 p-4 bg-accent/5 rounded-xl border border-accent/10">
                                <p className="text-xs text-accent font-medium mb-1">💡 Consejo</p>
                                <p className="text-xs text-text-muted">
                                    Si no estás seguro del nivel, selecciona el que mejor describa tu situación actual.
                                    No hay respuestas correctas o incorrectas.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
