import { NextRequest, NextResponse } from 'next/server';
import { isAllowedAdmin } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

type LoginErrorCode = 'invalid' | 'credentials' | 'forbidden' | 'config';

const ERROR_TEXT: Record<LoginErrorCode, string> = {
    invalid: 'Correo y contraseña son obligatorios.',
    credentials: 'Correo o contraseña incorrectos.',
    forbidden: 'Esta cuenta no tiene acceso de administrador.',
    config: 'La autenticación no está configurada.',
};

function isJsonRequest(request: NextRequest) {
    return (request.headers.get('content-type') || '').includes('application/json');
}

function failure(request: NextRequest, status: number, code: LoginErrorCode) {
    if (!isJsonRequest(request)) {
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('error', code);
        return NextResponse.redirect(url, { status: 303, headers: NO_STORE });
    }
    return NextResponse.json({ error: ERROR_TEXT[code] }, { status, headers: NO_STORE });
}

export async function POST(request: NextRequest) {
    let email = '';
    let password = '';

    try {
        if (isJsonRequest(request)) {
            const body = await request.json();
            email = typeof body?.email === 'string' ? body.email.trim() : '';
            password = typeof body?.password === 'string' ? body.password : '';
        } else {
            const form = await request.formData();
            email = String(form.get('email') || '').trim();
            password = String(form.get('password') || '');
        }
    } catch {
        return failure(request, 400, 'invalid');
    }

    if (!email || !password || email.length > 320 || password.length > 1024) {
        return failure(request, 400, 'invalid');
    }

    const supabase = createSupabaseServerClient();
    if (!supabase) {
        return failure(request, 503, 'config');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
        return failure(request, 401, 'credentials');
    }

    if (!isAllowedAdmin(data.user.email, process.env.ADMIN_EMAILS)) {
        await supabase.auth.signOut();
        return failure(request, 403, 'forbidden');
    }

    if (!isJsonRequest(request)) {
        return NextResponse.redirect(new URL('/admin', request.url), { status: 303, headers: NO_STORE });
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
