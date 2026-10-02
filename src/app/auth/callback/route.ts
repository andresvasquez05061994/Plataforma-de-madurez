import { NextRequest, NextResponse } from 'next/server';
import { googleCallbackDestination, publicOriginFrom } from '@/lib/admin-auth';
import { createRedirectingSupabase } from '@/lib/supabase/redirect-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const origin = publicOriginFrom({
        requestUrl: request.url,
        forwardedHost: request.headers.get('x-forwarded-host'),
        nodeEnv: process.env.NODE_ENV,
    });
    const { supabase, applyCookies } = createRedirectingSupabase(request);
    const params = request.nextUrl.searchParams;

    const send = (path: string) => applyCookies(NextResponse.redirect(`${origin}${path}`));

    const code = params.get('code');
    if (params.get('error') || !code || code.length > 2048) {
        return send('/admin/login?error=oauth');
    }
    if (!supabase) return send('/admin/login?error=config');

    const flowId = params.get('sb_flow_id');
    const { data, error } = await supabase.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined
    );

    if (error) {
        await supabase.auth.signOut().catch(() => undefined);
        return send('/admin/login?error=oauth');
    }

    const email = data.user?.email ?? data.session?.user?.email ?? null;
    if (googleCallbackDestination(email, process.env.ADMIN_EMAILS) !== '/admin') {
        await supabase.auth.signOut().catch(() => undefined);
        return send('/admin/login?error=forbidden');
    }

    return send('/admin');
}
