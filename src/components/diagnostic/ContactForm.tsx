'use client';

import { useState } from 'react';

interface ContactFormProps {
    name: string;
    email: string;
    role: string;
    currentField: number;
    onChangeName: (value: string) => void;
    onChangeEmail: (value: string) => void;
    onChangeRole: (value: string) => void;
    onNext: () => void;
    onFinish: () => void;
}

export default function ContactForm({ name, email, role, currentField, onChangeName, onChangeEmail, onChangeRole, onNext, onFinish }: ContactFormProps) {
    const [emailError, setEmailError] = useState('');

    const validateEmail = (e: string) => {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
        setEmailError(e && !valid ? 'Por favor ingresa un email válido' : '');
        return valid;
    };

    const continueBtn = (enabled: boolean, onClick: () => void, label = 'Continuar →') => (
        <button
            onClick={onClick}
            disabled={!enabled}
            className={`px-7 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                enabled ? 'bg-accent text-navy-800 shadow-gold hover:shadow-gold-lg' : 'bg-surface-alt text-light cursor-not-allowed'
            }`}
        >
            {label}
        </button>
    );

    if (currentField === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <span className="inline-block text-xs font-semibold text-accent tracking-wider mb-5 uppercase">Contacto</span>
                <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground leading-snug mb-8">¿Cuál es su nombre?</h2>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onChangeName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="tf-input text-xl"
                    onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onNext(); }}
                    autoFocus
                />
                <div className="flex justify-end mt-6">{continueBtn(!!name.trim(), onNext)}</div>
            </div>
        );
    }

    if (currentField === 1) {
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <span className="inline-block text-xs font-semibold text-accent tracking-wider mb-5 uppercase">Contacto</span>
                <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground leading-snug mb-8">¿Cuál es su correo electrónico?</h2>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => { onChangeEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
                    placeholder="tu@empresa.com"
                    className={`tf-input text-xl ${emailError ? '!border-b-urgency' : ''}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' && email.trim() && validateEmail(email)) onNext(); }}
                    autoFocus
                />
                {emailError && <p className="text-urgency text-sm mt-2">{emailError}</p>}
                <div className="flex justify-end mt-6">{continueBtn(!!email.trim(), () => { if (validateEmail(email)) onNext(); })}</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-2 mb-5">
                <span className="text-xs font-semibold text-accent tracking-wider uppercase">Contacto</span>
                <span className="text-xs text-light">(Opcional)</span>
            </div>
            <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-foreground leading-snug mb-8">¿Cuál es su cargo?</h2>
            <input
                type="text"
                value={role}
                onChange={(e) => onChangeRole(e.target.value)}
                placeholder="Ej: Director de Ingeniería, Gerente de Proyectos..."
                className="tf-input text-xl"
                onKeyDown={(e) => { if (e.key === 'Enter') onFinish(); }}
                autoFocus
            />
            <div className="flex justify-end mt-6">
                <button
                    onClick={onFinish}
                    className="px-8 py-3.5 rounded-2xl font-syne font-bold text-base bg-accent text-navy-800 shadow-gold hover:shadow-gold-lg hover:scale-[1.02] active:scale-100 transition-all duration-300"
                >
                    Ver mis resultados →
                </button>
            </div>
        </div>
    );
}
