import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAuthorizeUrl, publicOriginFrom } from '@/lib/admin-auth';
import { createRedirectingSupabase } from '@/lib/supabase/redirect-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const origin = publicOriginFrom({
        requestUrl: request.url,
        forwardedHost: request.headers.get('x-forwarded-host'),
        nodeEnv: process.env.NODE_ENV,
    });
    const { supabase, applyCookies } = createRedirectingSupabase(request);

    const fail = (code: 'config' | 'oauth') =>
        applyCookies(NextResponse.redirect(`${origin}/admin/login?error=${code}`, { status: 303 }));

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabase || !supabaseUrl) return fail('config');

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
            queryParams: { prompt: 'select_account' },
        },
    });

    if (error || !data.url || !isSupabaseAuthorizeUrl(data.url, supabaseUrl)) {
        return fail('oauth');
    }

    return applyCookies(NextResponse.redirect(data.url, { status: 303 }));
}
