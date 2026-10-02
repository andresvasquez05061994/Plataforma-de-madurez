import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { resolveServiceRoleKey } from '@/lib/admin-auth';

/**
 * Privileged client for admin reads. The service role bypasses RLS, so callers
 * must already have passed the admin allowlist check.
 */
export function createServiceRoleClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = resolveServiceRoleKey(
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    if (!url || !key) return null;

    return createClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
