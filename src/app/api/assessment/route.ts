import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { createServiceRoleClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function GET() {
    const auth = await requireAdmin();
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status, headers: NO_STORE });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
        return NextResponse.json(
            { error: 'El panel de administración no está configurado' },
            { status: 503, headers: NO_STORE }
        );
    }

    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Assessment GET error:', error.message);
            return NextResponse.json(
                { error: 'No se pudieron obtener los diagnósticos' },
                { status: 500, headers: NO_STORE }
            );
        }

        return NextResponse.json({ assessments: data ?? [] }, { headers: NO_STORE });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown';
        console.error('Assessment GET error:', message);
        return NextResponse.json(
            { error: 'No se pudieron obtener los diagnósticos' },
            { status: 500, headers: NO_STORE }
        );
    }
}
