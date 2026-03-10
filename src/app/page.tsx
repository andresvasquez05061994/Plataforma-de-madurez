'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/assessment-store';
import { IndustryType, ServiceType } from '@/types/assessment';
import { serviceSections } from '@/data/sections';
import IACLogo from '@/components/brand/IACLogo';

const employeeRanges: { key: string; label: string; desc: string }[] = [
    { key: '1-10',    label: '1 – 10',     desc: 'Microempresa' },
    { key: '11-50',   label: '11 – 50',    desc: 'Pequeña empresa' },
    { key: '51-200',  label: '51 – 200',   desc: 'Mediana empresa' },
    { key: '201-500', label: '201 – 500',  desc: 'Empresa grande' },
    { key: '501+',    label: '501 o más',  desc: 'Gran corporación' },
];

const industries: { key: IndustryType; label: string; icon: string; desc: string }[] = [
    { key: 'construccion', label: 'Construcción', icon: '🏗️', desc: 'Infraestructura, obra civil y edificación' },
    { key: 'manufactura', label: 'Manufactura', icon: '⚙️', desc: 'Producción industrial y fabricación' },
    { key: 'servicios', label: 'Servicios / BPO', icon: '💼', desc: 'Servicios profesionales y tercerización' },
];

const serviceInfo: { key: ServiceType; title: string; icon: string; desc: string; color: string }[] = [
    { key: 'bim', title: 'BIM', icon: '🏗️', desc: 'Building Information Modeling', color: '#1A1AFF' },
    { key: 'ia', title: 'IA / RPA', icon: '🤖', desc: 'Inteligencia Artificial y Automatización', color: '#7C3AED' },
    { key: 'plm', title: 'PLM', icon: '⚙️', desc: 'Product Lifecycle Management', color: '#059669' },
];

export default function LandingPage() {
    const router = useRouter();
    const {
        filterStep,
        setFilterStep,
        answers,
        setCompany,
        setEmployees,
        setIndustry,
        toggleService,
        startDiagnostic,
        reset,
    } = useAssessmentStore();

    const inputRef = useRef<HTMLInputElement>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

    const { company, employees, industry, selectedServices } = answers.generalInfo;

    const getCount = (svc: string) => liveCounts[svc] ?? serviceSections.find(s => s.key === svc)?.questionCount ?? 9;
    const questionCount = selectedServices.reduce((sum, svc) => sum + getCount(svc), 0);

    useEffect(() => {
        reset();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('iac-assessment-store-v1');
        }
    }, [reset]);

    useEffect(() => {
        const services: ServiceType[] = ['bim', 'ia', 'plm'];
        for (const svc of services) {
            fetch(`/api/questions/${svc}`, { cache: 'no-store' })
                .then(r => r.json())
                .then(data => {
                    if (data.questions?.length > 0) {
                        setLiveCounts(prev => ({ ...prev, [svc]: data.questions.length }));
                    }
                })
                .catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (filterStep === 0 && inputRef.current) {
            inputRef.current.focus();
        }
    }, [filterStep]);

    const handleNextStep = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setFilterStep(filterStep + 1);
            setIsTransitioning(false);
        }, 300);
    };

    const handlePrevStep = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setFilterStep(filterStep - 1);
            setIsTransitioning(false);
        }, 300);
    };

    const handleStart = () => {
        startDiagnostic();
        router.push('/diagnostico');
    };

    // Step 0: Company name
    const renderCompanyStep = () => (
        <div className={`w-full max-w-xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    1 / 4
                </span>
            </div>
            <h2 className="font-syne font-bold text-2xl sm:text-3xl text-foreground leading-snug mb-2">
                ¿Cuál es el nombre de su empresa?
            </h2>
            <p className="text-text-muted text-sm mb-8">
                Comencemos por conocer su organización para personalizar el diagnóstico.
            </p>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ej: Constructora ABC S.A.S."
                    className="w-full px-5 py-4 bg-surface-white border-2 border-border-light rounded-xl
                       text-foreground placeholder:text-text-light text-lg
                       focus:border-accent focus:ring-0 focus:outline-none
                       transition-all duration-300"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && company.trim()) handleNextStep();
                    }}
                />
            </div>
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleNextStep}
                    disabled={!company.trim()}
                    className={`px-8 py-3 rounded-xl font-syne font-bold text-sm transition-all duration-300
              ${company.trim()
                            ? 'bg-accent text-white hover:bg-accent-dark shadow-lg shadow-accent/20 hover:shadow-xl hover:scale-105 active:scale-100'
                            : 'bg-surface-muted text-text-light cursor-not-allowed'
                        }`}
                >
                    Continuar →
                </button>
            </div>
        </div>
    );

    // Step 1: Employee count
    const renderEmployeesStep = () => (
        <div className={`w-full max-w-xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    2 / 4
                </span>
            </div>
            <h2 className="font-syne font-bold text-2xl sm:text-3xl text-foreground leading-snug mb-2">
                ¿Cuántos empleados tiene su organización?
            </h2>
            <p className="text-text-muted text-sm mb-8">
                Esto nos ayuda a contextualizar el nivel de madurez esperado.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employeeRanges.map((range) => (
                    <button
                        key={range.key}
                        onClick={() => {
                            setEmployees(range.key);
                            setTimeout(handleNextStep, 350);
                        }}
                        className={`text-left p-5 rounded-xl border-2 transition-all duration-300
                            ${employees === range.key
                                ? 'bg-accent/5 border-accent shadow-lg shadow-accent/10 scale-[1.01]'
                                : 'bg-surface-white border-border-light hover:border-accent/30 hover:shadow-md'
                            }`}
                    >
                        <p className={`font-semibold text-base transition-colors ${employees === range.key ? 'text-accent' : 'text-foreground'}`}>
                            {range.label}
                        </p>
                        <p className="text-sm text-text-muted mt-0.5">{range.desc}</p>
                        {employees === range.key && (
                            <span className="text-accent text-sm mt-1 inline-block">✓</span>
                        )}
                    </button>
                ))}
            </div>
            <div className="flex justify-start mt-6">
                <button
                    onClick={handlePrevStep}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Anterior
                </button>
            </div>
        </div>
    );

    // Step 2: Industry selection
    const renderIndustryStep = () => (
        <div className={`w-full max-w-xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    3 / 4
                </span>
            </div>
            <h2 className="font-syne font-bold text-2xl sm:text-3xl text-foreground leading-snug mb-2">
                ¿En qué industria opera su organización?
            </h2>
            <p className="text-text-muted text-sm mb-8">
                Esto nos permite adaptar el lenguaje del diagnóstico a su sector.
            </p>
            <div className="space-y-3">
                {industries.map((ind) => (
                    <button
                        key={ind.key}
                        onClick={() => {
                            setIndustry(ind.key);
                            setTimeout(handleNextStep, 400);
                        }}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 group
                ${industry === ind.key
                                ? 'bg-accent/5 border-accent shadow-lg shadow-accent/10 scale-[1.01]'
                                : 'bg-surface-white border-border-light hover:border-accent/30 hover:shadow-md'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">{ind.icon}</span>
                            <div className="flex-1">
                                <p className={`font-semibold text-base transition-colors ${industry === ind.key ? 'text-accent' : 'text-foreground'
                                    }`}>
                                    {ind.label}
                                </p>
                                <p className="text-sm text-text-muted mt-0.5">{ind.desc}</p>
                            </div>
                            {industry === ind.key && (
                                <span className="text-accent animate-scale-in text-lg">✓</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
            <div className="flex justify-start mt-6">
                <button
                    onClick={handlePrevStep}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Anterior
                </button>
            </div>
        </div>
    );

    // Step 2: Service selection with live sidebar
    const renderServiceStep = () => (
        <div className={`w-full transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-5xl mx-auto">
                {/* Main content */}
                <div className="flex-1 max-w-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                            4 / 4
                        </span>
                    </div>
                    <h2 className="font-syne font-bold text-2xl sm:text-3xl text-foreground leading-snug mb-2">
                        ¿Qué evaluaciones aplican a su organización?
                    </h2>
                    <p className="text-text-muted text-sm mb-8">
                        Seleccione los servicios que desea evaluar. Puede elegir uno o varios.
                    </p>

                    <div className="space-y-3">
                        {serviceInfo.map((svc) => {
                            const isSelected = selectedServices.includes(svc.key);
                            return (
                                <button
                                    key={svc.key}
                                    onClick={() => toggleService(svc.key)}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 group
                    ${isSelected
                                            ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10 scale-[1.01]'
                                            : 'bg-surface-white border-border-light hover:border-accent/30 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Checkbox */}
                                        <div
                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0
                        ${isSelected
                                                    ? 'bg-accent border-accent'
                                                    : 'border-border-dark group-hover:border-accent/40'
                                                }`}
                                        >
                                            {isSelected && (
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-scale-in">
                                                    <path d="M3 7l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>

                                        <span className="text-2xl">{svc.icon}</span>
                                        <div className="flex-1">
                                            <p className={`font-syne font-bold text-lg transition-colors ${isSelected ? 'text-accent' : 'text-foreground'
                                                }`}>
                                                {svc.title}
                                            </p>
                                            <p className="text-sm text-text-muted">{svc.desc}</p>
                                        </div>
                                        <span className="text-xs text-text-light bg-surface-muted px-2 py-1 rounded-full">
                                            {getCount(svc.key)} preguntas
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={handlePrevStep}
                            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-foreground transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Anterior
                        </button>
                        <button
                            onClick={handleStart}
                            disabled={selectedServices.length === 0}
                            className={`px-8 py-3 rounded-xl font-syne font-bold text-sm transition-all duration-300 transform
                ${selectedServices.length > 0
                                    ? 'bg-accent text-white hover:bg-accent-dark shadow-xl shadow-accent/25 hover:shadow-2xl hover:scale-105 active:scale-100'
                                    : 'bg-surface-muted text-text-light cursor-not-allowed'
                                }`}
                        >
                            Comenzar diagnóstico →
                        </button>
                    </div>
                </div>

                {/* Live sidebar panel */}
                <div className="lg:w-72 hidden lg:block">
                    <div className="sticky top-8 bg-surface-white rounded-2xl border border-border-light p-6 shadow-sm">
                        <h3 className="font-syne font-bold text-sm text-foreground mb-4 uppercase tracking-wide">
                            Tu diagnóstico
                        </h3>

                        {/* Company info */}
                        <div className="mb-5 pb-5 border-b border-border-light">
                            <p className="text-xs text-text-light uppercase tracking-wide mb-1">Empresa</p>
                            <p className="text-sm font-medium text-foreground truncate">{company || '—'}</p>
                            <p className="text-xs text-text-light uppercase tracking-wide mt-3 mb-1">Empleados</p>
                            <p className="text-sm font-medium text-foreground">
                                {employeeRanges.find(r => r.key === employees)?.label || '—'}
                            </p>
                            <p className="text-xs text-text-light uppercase tracking-wide mt-3 mb-1">Industria</p>
                            <p className="text-sm font-medium text-foreground">
                                {industries.find(i => i.key === industry)?.label || '—'}
                            </p>
                        </div>

                        {/* Selected services */}
                        <div className="mb-5">
                            <p className="text-xs text-text-light uppercase tracking-wide mb-3">Evaluaciones</p>
                            {selectedServices.length === 0 ? (
                                <p className="text-xs text-text-light italic">Ninguna seleccionada</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedServices.map((svc) => {
                                        const info = serviceInfo.find(s => s.key === svc);
                                        return (
                                            <div key={svc} className="flex items-center gap-2 text-sm animate-scale-in">
                                                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                                                <span className="font-medium text-foreground">{info?.title}</span>
                                                <span className="text-text-light text-xs ml-auto">
                                                    {getCount(svc)}p
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Total question count */}
                        <div className="bg-accent/5 rounded-xl p-4 text-center">
                            <p className="text-3xl font-syne font-extrabold text-accent">
                                {questionCount}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                                preguntas en total
                            </p>
                            {questionCount > 0 && (
                                <p className="text-xs text-text-light mt-2">
                                    ~{Math.ceil(questionCount * 0.5)} min estimados
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile summary bar */}
            {selectedServices.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-white/95 backdrop-blur-md border-t border-border-light px-4 py-3 z-30 animate-slide-up">
                    <div className="flex items-center justify-between max-w-xl mx-auto">
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {selectedServices.length} evaluación{selectedServices.length > 1 ? 'es' : ''}
                            </p>
                            <p className="text-xs text-text-muted">
                                {questionCount} preguntas · ~{Math.ceil(questionCount * 0.5)} min
                            </p>
                        </div>
                        <button
                            onClick={handleStart}
                            className="px-5 py-2.5 rounded-xl font-syne font-bold text-sm bg-accent text-white shadow-lg shadow-accent/20"
                        >
                            Comenzar →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
            {/* Background removed as per user request to match white logo background */}


            <div className="w-full relative z-10">
                {/* Logo (persistent) */}
                <div className="text-center mb-8 sm:mb-12 animate-fade-in">
                    <IACLogo size="lg" className="mb-3" />
                    <p className="text-text-muted text-xs sm:text-sm font-medium tracking-wide uppercase">
                        Diagnóstico de Madurez Digital
                    </p>
                </div>

                {/* Steps */}
                {filterStep === 0 && renderCompanyStep()}
                {filterStep === 1 && renderEmployeesStep()}
                {filterStep === 2 && renderIndustryStep()}
                {filterStep === 3 && renderServiceStep()}

                {/* Step indicators (on steps 0-2) */}
                {filterStep < 3 && (
                    <div className="flex justify-center gap-2 mt-12 animate-fade-in">
                        {[0, 1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`h-1.5 rounded-full transition-all duration-500 ${step === filterStep
                                    ? 'w-8 bg-accent'
                                    : step < filterStep
                                        ? 'w-4 bg-accent/40'
                                        : 'w-4 bg-border-light'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Trust indicators (solo en primer paso) */}
                {filterStep === 0 && (
                    <div className="text-center mt-16 pt-8 border-t border-border-light animate-fade-in max-w-xl mx-auto" style={{ animationDelay: '0.5s' }}>
                        <p className="text-text-light text-xs mb-4 uppercase tracking-wider">Metodología basada en</p>
                        <div className="flex flex-wrap justify-center gap-6 text-text-muted text-sm font-medium">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                                Marco Gartner
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                                ISO 19650
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                                CMMI
                            </span>
                        </div>
                        <p className="text-text-light text-[10px] mt-6 italic">
                            Ingeniería Asistida por Computador — 30 años elevando la eficiencia de los negocios
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
