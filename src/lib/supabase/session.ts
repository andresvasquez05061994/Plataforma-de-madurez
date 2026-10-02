import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { emailFromClaims } from '@/lib/admin-auth';

export interface SessionRead {
    response: NextResponse;
    email: string | null;
}

function copySession(from: NextResponse, to: NextResponse) {
    from.cookies.getAll().forEach((cookie) => {
        to.cookies.set(cookie);
    });
    for (const header of ['cache-control', 'expires', 'pragma']) {
        const value = from.headers.get(header);
        if (value) to.headers.set(header, value);
    }
    return to;
}

/**
 * Verifies the session cookie with getClaims() and refreshes it when needed.
 * Returns null email when auth is not configured or the token does not verify.
 */
export async function readSessionEmail(request: NextRequest): Promise<SessionRead> {
    let response = NextResponse.next({ request });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        return { response, email: null };
    }

    const supabase = createServerClient(url, anonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet, headers) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
                Object.entries(headers).forEach(([key, value]) => {
                    response.headers.set(key, value);
                });
            },
        },
    });

    let email: string | null = null;
    try {
        const { data, error } = await supabase.auth.getClaims();
        if (!error && data?.claims) {
            email = emailFromClaims(data.claims);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown';
        console.error('Auth verification failed:', message);
        email = null;
    }

    return { response, email };
}

export { copySession };
