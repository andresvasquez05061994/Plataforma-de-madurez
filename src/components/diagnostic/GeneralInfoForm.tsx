'use client';

import VoiceInput from './VoiceInput';

interface GeneralInfoFormProps {
    company: string;
    industry: string;
    employees: string;
    currentField: number;
    onChangeCompany: (value: string) => void;
    onChangeEmployees: (value: string) => void;
    onNext: () => void;
}

const employeeRanges = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function GeneralInfoForm({ company, industry, employees, currentField, onChangeCompany, onChangeEmployees, onNext }: GeneralInfoFormProps) {
    if (currentField === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <span className="inline-block text-xs font-semibold text-accent tracking-wider mb-5">1 → 3</span>
                <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground leading-snug mb-8">¿Cuál es el nombre de su empresa?</h2>
                <div className="relative">
                    <input type="text" value={company} onChange={(e) => onChangeCompany(e.target.value)} placeholder="Ej: Constructora ABC S.A.S." className="tf-input text-xl" onKeyDown={(e) => { if (e.key === 'Enter' && company.trim()) onNext(); }} autoFocus />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2"><VoiceInput onTranscript={(t) => onChangeCompany(t)} /></div>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onNext} disabled={!company.trim()} className={`px-7 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${company.trim() ? 'bg-accent text-navy-800 shadow-gold hover:shadow-gold-lg' : 'bg-surface-alt text-light cursor-not-allowed'}`}>Continuar →</button>
                </div>
            </div>
        );
    }

    if (currentField === 1) {
        const industryLabels: Record<string, string> = { construccion: '🏗️ Construcción', manufactura: '⚙️ Manufactura', servicios: '💼 Servicios / BPO' };
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <span className="inline-block text-xs font-semibold text-accent tracking-wider mb-5">2 → 3</span>
                <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground leading-snug mb-8">Industria seleccionada</h2>
                <div className="p-5 bg-accent/8 border-2 border-accent/20 rounded-2xl mb-6">
                    <p className="text-lg font-medium text-foreground">{industryLabels[industry] || industry || 'No seleccionada'}</p>
                    <p className="text-sm text-muted mt-1">Seleccionada en la página anterior. Si necesitas cambiar, regresa al inicio.</p>
                </div>
                <div className="flex justify-end">
                    <button onClick={onNext} className="px-7 py-3 rounded-2xl font-semibold text-sm bg-accent text-navy-800 shadow-gold hover:shadow-gold-lg transition-all duration-200">Continuar →</button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <span className="inline-block text-xs font-semibold text-accent tracking-wider mb-5">3 → 3</span>
            <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground leading-snug mb-8">¿Cuántos empleados tiene su organización?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {employeeRanges.map((range) => (
                    <button key={range} onClick={() => { onChangeEmployees(range); setTimeout(onNext, 300); }} className={`p-4 rounded-2xl border-2 text-center font-medium transition-all duration-200 ${employees === range ? 'bg-accent-light border-accent text-navy-700 shadow-card' : 'bg-surface border-border text-foreground hover:border-border-focus hover:shadow-card'}`}>{range}</button>
                ))}
            </div>
        </div>
    );
}
