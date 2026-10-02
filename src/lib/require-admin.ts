import 'server-only';
import { adminDataAccess, emailFromClaims, type AdminDataAccess } from '@/lib/admin-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type RequireAdminResult = AdminDataAccess;

/** Verifies the caller again inside the route. Middleware is not sufficient. */
export async function requireAdmin(): Promise<RequireAdminResult> {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
        return { ok: false, status: 401, error: 'Autenticación requerida' };
    }

    let email: string | null = null;
    try {
        const { data, error } = await supabase.auth.getClaims();
        if (!error && data?.claims) {
            email = emailFromClaims(data.claims);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown';
        console.error('Auth verification failed:', message);
    }

    return adminDataAccess(
        email,
        process.env.ADMIN_EMAILS,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}
