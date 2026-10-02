import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

type PendingCookie = { name: string; value: string; options: CookieOptions };

/**
 * Supabase client whose auth cookies are collected and copied onto the
 * response we actually return. Required for the PKCE verifier: signInWithOAuth
 * stores it in a cookie, and that Set-Cookie must ride on the redirect to Google.
 */
export function createRedirectingSupabase(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const jar: PendingCookie[] = [];
    let headerBag: Record<string, string> = {};

    if (!supabaseUrl || !anonKey) {
        return {
            supabase: null,
            applyCookies(response: NextResponse) {
                response.headers.set('Cache-Control', 'private, no-store');
                return response;
            },
        };
    }

    const supabase = createServerClient(supabaseUrl, anonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet, headers) {
                cookiesToSet.forEach((cookie) => {
                    const index = jar.findIndex((item) => item.name === cookie.name);
                    if (index >= 0) jar[index] = cookie;
                    else jar.push(cookie);
                    request.cookies.set(cookie.name, cookie.value);
                });
                headerBag = { ...headerBag, ...headers };
            },
        },
    });

    return {
        supabase,
        applyCookies(response: NextResponse) {
            jar.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
            });
            for (const [key, value] of Object.entries(headerBag)) {
                response.headers.set(key, value);
            }
            if (!response.headers.get('cache-control')) {
                response.headers.set('Cache-Control', 'private, no-store');
            }
            return response;
        },
    };
}
