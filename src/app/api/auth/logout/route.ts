import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function POST() {
    const supabase = createSupabaseServerClient();
    if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Sign out error:', error.message);
            return NextResponse.json(
                { error: 'No se pudo cerrar la sesión' },
                { status: 500, headers: NO_STORE }
            );
        }
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
