'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/assessment-store';
import { IndustryType, ServiceType } from '@/types/assessment';
import { serviceSections } from '@/data/sections';
import IACLogo from '@/components/brand/IACLogo';
import VoiceInput from '@/components/diagnostic/VoiceInput';

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

const serviceInfo: { key: ServiceType; title: string; icon: string; desc: string }[] = [
    { key: 'bim', title: 'BIM', icon: '🏗️', desc: 'Building Information Modeling' },
    { key: 'ia', title: 'IA / RPA', icon: '🤖', desc: 'Inteligencia Artificial y Automatización' },
    { key: 'plm', title: 'PLM', icon: '⚙️', desc: 'Product Lifecycle Management' },
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

    const goNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setFilterStep(filterStep + 1);
            setIsTransitioning(false);
        }, 300);
    };

    const goBack = () => {
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

    const stepIndicator = (current: number, total: number) => (
        <span className="inline-block text-xs font-semibold text-accent tracking-wider mb-6">
            {current} → {total}
        </span>
    );

    const backButton = () => (
        <button
            onClick={goBack}
            className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1"
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Atrás
        </button>
    );

    const nextBtn = (enabled: boolean, label = 'Continuar', onClick = goNext) => (
        <button
            onClick={onClick}
            disabled={!enabled}
            className={`px-8 py-3.5 rounded-2xl font-syne font-bold text-sm transition-all duration-300 ${
                enabled
                    ? 'bg-accent text-navy-800 shadow-gold hover:shadow-gold-lg hover:scale-[1.02] active:scale-100'
                    : 'bg-surface-alt text-light cursor-not-allowed'
            }`}
        >
            {label} →
        </button>
    );

    const wrapper = `w-full max-w-xl mx-auto transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`;

    // ─── Step 0: Company ───
    const renderCompanyStep = () => (
        <div className={wrapper}>
            {stepIndicator(1, 4)}
            <h2 className="font-syne font-medium text-3xl sm:text-4xl text-foreground leading-tight mb-3">
                ¿Cuál es el nombre de su empresa?
            </h2>
            <p className="text-muted text-base mb-10">
                Comencemos por conocer su organización.
            </p>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ej: Constructora ABC S.A.S."
                    className="tf-input text-xl pr-14"
                    onKeyDown={(e) => { if (e.key === 'Enter' && company.trim()) goNext(); }}
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <VoiceInput onTranscript={(t) => setCompany(company ? `${company} ${t}` : t)} />
                </div>
            </div>
            <div className="flex items-center justify-between mt-8">
                <p className="text-light text-xs">🎤 Puedes dictar el nombre con tu voz</p>
                {nextBtn(!!company.trim())}
            </div>
        </div>
    );

    // ─── Step 1: Employees ───
    const renderEmployeesStep = () => (
        <div className={wrapper}>
            {stepIndicator(2, 4)}
            <h2 className="font-syne font-medium text-3xl sm:text-4xl text-foreground leading-tight mb-3">
                ¿Cuántos empleados tiene?
            </h2>
            <p className="text-muted text-base mb-10">
                Esto contextualiza el nivel de madurez esperado.
            </p>
            <div className="space-y-3">
                {employeeRanges.map((range) => (
                    <button
                        key={range.key}
                        onClick={() => { setEmployees(range.key); setTimeout(goNext, 350); }}
                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${
                            employees === range.key
                                ? 'border-accent bg-accent-light shadow-card'
                                : 'border-border bg-surface hover:border-border-focus hover:shadow-card'
                        }`}
                    >
                        <span className={`font-semibold ${employees === range.key ? 'text-navy-700' : 'text-foreground'}`}>
                            {range.label}
                        </span>
                        <span className="text-muted text-sm ml-3">{range.desc}</span>
                    </button>
                ))}
            </div>
            <div className="flex justify-start mt-8">{backButton()}</div>
        </div>
    );

    // ─── Step 2: Industry ───
    const renderIndustryStep = () => (
        <div className={wrapper}>
            {stepIndicator(3, 4)}
            <h2 className="font-syne font-medium text-3xl sm:text-4xl text-foreground leading-tight mb-3">
                ¿En qué industria opera?
            </h2>
            <p className="text-muted text-base mb-10">
                Adaptamos el diagnóstico a su sector.
            </p>
            <div className="space-y-3">
                {industries.map((ind) => (
                    <button
                        key={ind.key}
                        onClick={() => { setIndustry(ind.key); setTimeout(goNext, 400); }}
                        className={`w-full text-left px-5 py-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                            industry === ind.key
                                ? 'border-accent bg-accent-light shadow-card'
                                : 'border-border bg-surface hover:border-border-focus hover:shadow-card'
                        }`}
                    >
                        <span className="text-2xl">{ind.icon}</span>
                        <div>
                            <p className={`font-semibold ${industry === ind.key ? 'text-navy-700' : 'text-foreground'}`}>{ind.label}</p>
                            <p className="text-muted text-sm">{ind.desc}</p>
                        </div>
                        {industry === ind.key && <span className="ml-auto text-accent text-lg">✓</span>}
                    </button>
                ))}
            </div>
            <div className="flex justify-start mt-8">{backButton()}</div>
        </div>
    );

    // ─── Step 3: Services ───
    const renderServiceStep = () => (
        <div className={`w-full transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="flex flex-col lg:flex-row gap-10 max-w-5xl mx-auto">
                <div className="flex-1 max-w-xl">
                    {stepIndicator(4, 4)}
                    <h2 className="font-syne font-medium text-3xl sm:text-4xl text-foreground leading-tight mb-3">
                        ¿Qué evaluaciones aplican?
                    </h2>
                    <p className="text-muted text-base mb-10">
                        Seleccione uno o varios servicios a evaluar.
                    </p>

                    <div className="space-y-3">
                        {serviceInfo.map((svc) => {
                            const isSelected = selectedServices.includes(svc.key);
                            return (
                                <button
                                    key={svc.key}
                                    onClick={() => toggleService(svc.key)}
                                    className={`w-full text-left px-5 py-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                                        isSelected
                                            ? 'border-accent bg-accent-light shadow-card'
                                            : 'border-border bg-surface hover:border-border-focus hover:shadow-card'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                        isSelected ? 'bg-accent border-accent' : 'border-border-focus'
                                    }`}>
                                        {isSelected && (
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-6" stroke="#1B2A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        )}
                                    </div>
                                    <span className="text-2xl">{svc.icon}</span>
                                    <div className="flex-1">
                                        <p className={`font-syne font-bold text-lg ${isSelected ? 'text-navy-700' : 'text-foreground'}`}>{svc.title}</p>
                                        <p className="text-muted text-sm">{svc.desc}</p>
                                    </div>
                                    <span className="text-xs text-muted bg-surface-alt px-2.5 py-1 rounded-full">{getCount(svc.key)} preg.</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between mt-10">
                        {backButton()}
                        {nextBtn(selectedServices.length > 0, 'Comenzar diagnóstico', handleStart)}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:w-72 hidden lg:block">
                    <div className="sticky top-8 bg-surface rounded-3xl border border-border p-6 shadow-card">
                        <h3 className="font-syne font-bold text-xs text-muted uppercase tracking-widest mb-5">Tu diagnóstico</h3>
                        <div className="space-y-4 mb-6 pb-6 border-b border-border">
                            <div>
                                <p className="text-[10px] text-light uppercase tracking-wider">Empresa</p>
                                <p className="text-sm font-medium text-foreground truncate">{company || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-light uppercase tracking-wider">Empleados</p>
                                <p className="text-sm font-medium text-foreground">{employeeRanges.find(r => r.key === employees)?.label || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-light uppercase tracking-wider">Industria</p>
                                <p className="text-sm font-medium text-foreground">{industries.find(i => i.key === industry)?.label || '—'}</p>
                            </div>
                        </div>
                        {selectedServices.length > 0 ? (
                            <div className="space-y-2 mb-6">
                                {selectedServices.map((svc) => {
                                    const info = serviceInfo.find(s => s.key === svc);
                                    return (
                                        <div key={svc} className="flex items-center gap-2 text-sm">
                                            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                                            <span className="font-medium text-foreground">{info?.title}</span>
                                            <span className="text-light text-xs ml-auto">{getCount(svc)}p</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-light italic mb-6">Ninguna seleccionada</p>
                        )}
                        <div className="bg-accent/10 rounded-2xl p-4 text-center">
                            <p className="text-3xl font-syne font-extrabold text-accent">{questionCount}</p>
                            <p className="text-xs text-muted mt-1">preguntas · ~{Math.ceil(questionCount * 0.5)} min</p>
                        </div>
                    </div>
                </div>
            </div>

            {selectedServices.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border px-4 py-3 z-30 animate-slide-up">
                    <div className="flex items-center justify-between max-w-xl mx-auto">
                        <div>
                            <p className="text-sm font-medium text-foreground">{selectedServices.length} evaluación{selectedServices.length > 1 ? 'es' : ''}</p>
                            <p className="text-xs text-muted">{questionCount} preguntas · ~{Math.ceil(questionCount * 0.5)} min</p>
                        </div>
                        <button onClick={handleStart} className="px-5 py-2.5 rounded-2xl font-syne font-bold text-sm bg-accent text-navy-800 shadow-gold">
                            Comenzar →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
            <div className="w-full relative z-10">
                <div className="text-center mb-10 sm:mb-14 animate-fade-in">
                    <IACLogo size="lg" className="mb-4" />
                    <p className="text-muted text-xs sm:text-sm font-medium tracking-widest uppercase">
                        Diagnóstico de Madurez Digital
                    </p>
                </div>

                {filterStep === 0 && renderCompanyStep()}
                {filterStep === 1 && renderEmployeesStep()}
                {filterStep === 2 && renderIndustryStep()}
                {filterStep === 3 && renderServiceStep()}

                {filterStep < 3 && (
                    <div className="flex justify-center gap-2 mt-14 animate-fade-in">
                        {[0, 1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`h-1 rounded-full transition-all duration-500 ${
                                    step === filterStep ? 'w-8 bg-accent' : step < filterStep ? 'w-4 bg-accent/50' : 'w-4 bg-border'
                                }`}
                            />
                        ))}
                    </div>
                )}

                {filterStep === 0 && (
                    <div className="text-center mt-16 pt-8 border-t border-border animate-fade-in max-w-xl mx-auto" style={{ animationDelay: '0.5s' }}>
                        <p className="text-light text-xs mb-4 uppercase tracking-widest">Metodología basada en</p>
                        <div className="flex flex-wrap justify-center gap-6 text-muted text-sm font-medium">
                            {['Marco Gartner', 'ISO 19650', 'CMMI'].map(m => (
                                <span key={m} className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />{m}
                                </span>
                            ))}
                        </div>
                        <p className="text-light text-[10px] mt-6 italic">
                            Ingeniería Asistida por Computador — 30 años elevando la eficiencia de los negocios
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
