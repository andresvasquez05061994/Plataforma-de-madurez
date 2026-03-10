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

const employeeRanges = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+',
];

export default function GeneralInfoForm({
    company,
    industry,
    employees,
    currentField,
    onChangeCompany,
    onChangeEmployees,
    onNext,
}: GeneralInfoFormProps) {
    // Field 0: Company name
    if (currentField === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                        1 / 3
                    </span>
                </div>
                <h2 className="font-syne font-bold text-xl sm:text-2xl text-foreground leading-snug mb-6">
                    ¿Cuál es el nombre de su empresa?
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        value={company}
                        onChange={(e) => onChangeCompany(e.target.value)}
                        placeholder="Ej: Constructora ABC S.A.S."
                        className="w-full px-5 py-4 bg-surface-white border-2 border-border-light rounded-xl
                       text-foreground placeholder:text-text-light text-lg
                       focus:border-accent focus:ring-0 focus:outline-none
                       transition-all duration-300"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && company.trim()) onNext();
                        }}
                        autoFocus
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <VoiceInput onTranscript={(t) => onChangeCompany(t)} />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onNext}
                        disabled={!company.trim()}
                        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
              ${company.trim()
                                ? 'bg-accent text-white hover:bg-accent-dark shadow-md shadow-accent/20'
                                : 'bg-surface-muted text-text-light cursor-not-allowed'
                            }`}
                    >
                        Continuar →
                    </button>
                </div>
            </div>
        );
    }

    // Field 1: Industry display (already selected in landing)
    if (currentField === 1) {
        const industryLabels: Record<string, string> = {
            construccion: '🏗️ Construcción',
            manufactura: '⚙️ Manufactura',
            servicios: '💼 Servicios / BPO',
        };
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                        2 / 3
                    </span>
                </div>
                <h2 className="font-syne font-bold text-xl sm:text-2xl text-foreground leading-snug mb-6">
                    Industria seleccionada
                </h2>
                <div className="p-5 bg-accent/5 border-2 border-accent/20 rounded-xl mb-6">
                    <p className="text-lg font-medium text-foreground">
                        {industryLabels[industry] || industry || 'No seleccionada'}
                    </p>
                    <p className="text-sm text-text-muted mt-1">
                        Seleccionada en la página anterior. Si necesitas cambiar, regresa al inicio.
                    </p>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={onNext}
                        className="px-6 py-2.5 rounded-xl font-medium text-sm bg-accent text-white hover:bg-accent-dark shadow-md shadow-accent/20 transition-all duration-300"
                    >
                        Continuar →
                    </button>
                </div>
            </div>
        );
    }

    // Field 2: Employee count
    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    3 / 3
                </span>
            </div>
            <h2 className="font-syne font-bold text-xl sm:text-2xl text-foreground leading-snug mb-6">
                ¿Cuántos empleados tiene su organización?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {employeeRanges.map((range) => (
                    <button
                        key={range}
                        onClick={() => {
                            onChangeEmployees(range);
                            setTimeout(onNext, 300);
                        }}
                        className={`
              p-4 rounded-xl border-2 text-center font-medium transition-all duration-300
              ${employees === range
                                ? 'bg-accent/5 border-accent text-accent shadow-md'
                                : 'bg-surface-white border-border-light text-foreground hover:border-accent/30 hover:shadow-sm'
                            }
            `}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>
    );
}
