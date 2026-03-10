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

export default function ContactForm({
    name,
    email,
    role,
    currentField,
    onChangeName,
    onChangeEmail,
    onChangeRole,
    onNext,
    onFinish,
}: ContactFormProps) {
    const [emailError, setEmailError] = useState('');

    const validateEmail = (e: string) => {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
        setEmailError(e && !valid ? 'Por favor ingresa un email válido' : '');
        return valid;
    };

    // Field 0: Name
    if (currentField === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                        Contacto
                    </span>
                </div>
                <h2 className="font-syne font-bold text-xl sm:text-2xl text-foreground leading-snug mb-6">
                    ¿Cuál es su nombre?
                </h2>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onChangeName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full px-5 py-4 bg-surface-white border-2 border-border-light rounded-xl
                     text-foreground placeholder:text-text-light text-lg
                     focus:border-accent focus:ring-0 focus:outline-none transition-all duration-300"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && name.trim()) onNext();
                    }}
                    autoFocus
                />
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onNext}
                        disabled={!name.trim()}
                        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
              ${name.trim()
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

    // Field 1: Email
    if (currentField === 1) {
        return (
            <div className="w-full max-w-2xl mx-auto animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                        Contacto
                    </span>
                </div>
                <h2 className="font-syne font-bold text-xl sm:text-2xl text-foreground leading-snug mb-6">
                    ¿Cuál es su correo electrónico?
                </h2>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        onChangeEmail(e.target.value);
                        if (emailError) validateEmail(e.target.value);
                    }}
                    placeholder="tu@empresa.com"
                    className={`w-full px-5 py-4 bg-surface-white border-2 rounded-xl
                     text-foreground placeholder:text-text-light text-lg
                     focus:ring-0 focus:outline-none transition-all duration-300
                     ${emailError ? 'border-urgency' : 'border-border-light focus:border-accent'}`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && email.trim() && validateEmail(email)) onNext();
                    }}
                    autoFocus
                />
                {emailError && <p className="text-urgency text-sm mt-2">{emailError}</p>}
                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => {
                            if (validateEmail(email)) onNext();
                        }}
                        disabled={!email.trim()}
                        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
              ${email.trim()
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

    // Field 2: Role (optional) + Finish
    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    Contacto
                </span>
                <span className="text-xs text-text-light">(Opcional)</span>
            </div>
            <h2 className="font-syne font-bold text-xl sm:text-2xl text-foreground leading-snug mb-6">
                ¿Cuál es su cargo?
            </h2>
            <input
                type="text"
                value={role}
                onChange={(e) => onChangeRole(e.target.value)}
                placeholder="Ej: Director de Ingeniería, Gerente de Proyectos..."
                className="w-full px-5 py-4 bg-surface-white border-2 border-border-light rounded-xl
                   text-foreground placeholder:text-text-light text-lg
                   focus:border-accent focus:ring-0 focus:outline-none transition-all duration-300"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') onFinish();
                }}
                autoFocus
            />
            <div className="flex justify-end mt-4">
                <button
                    onClick={onFinish}
                    className="px-8 py-3 rounded-xl font-syne font-bold text-base bg-accent text-white
                     hover:bg-accent-dark shadow-xl shadow-accent/25 hover:shadow-2xl
                     transition-all duration-300 hover:scale-105 active:scale-100"
                >
                    Ver mis resultados →
                </button>
            </div>
        </div>
    );
}
