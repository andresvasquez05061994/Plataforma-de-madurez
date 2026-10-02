'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ERRORS: Record<string, string> = {
    forbidden: 'Esta cuenta no tiene acceso de administrador.',
    credentials: 'Correo o contraseña incorrectos.',
    invalid: 'Correo y contraseña son obligatorios.',
    config: 'La autenticación no está configurada. Revisa las variables de entorno.',
};

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('error');
        if (!code) return;
        setError(ERRORS[code] || 'No se pudo iniciar sesión.');
        if (code === 'forbidden') {
            fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
        }
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(typeof data.error === 'string' ? data.error : 'No se pudo iniciar sesión.');
                return;
            }
            router.replace('/admin');
            router.refresh();
        } catch {
            setError('No se pudo iniciar sesión. Intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-3xl shadow-card p-8">
                <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-9 h-9 bg-navy-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-syne font-bold text-sm">M</span>
                    </div>
                    <div>
                        <p className="font-syne font-bold text-foreground">MaturityOS</p>
                        <p className="text-xs text-muted">Panel de administración</p>
                    </div>
                </div>

                <h1 className="font-syne font-bold text-2xl text-foreground mb-2">Ingresar</h1>
                <p className="text-sm text-muted mb-6">
                    Solo las cuentas incluidas en la lista de administradores pueden ver los diagnósticos.
                </p>

                <form action="/api/auth/login" method="post" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                            Correo
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-border-focus"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none focus:border-border-focus"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-urgency">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-2xl bg-navy-600 text-white font-semibold py-3 text-sm hover:bg-navy-700 disabled:opacity-60 transition-colors"
                    >
                        {submitting ? 'Ingresando...' : 'Entrar'}
                    </button>
                </form>

                <a href="/" className="inline-block mt-6 text-sm text-muted hover:text-foreground">
                    Volver al inicio
                </a>
            </div>
        </main>
    );
}
