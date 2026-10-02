/**
 * Authorization for the admin panel.
 *
 * Identity comes from the verified Supabase JWT `email` claim (auth.users),
 * never from `user_metadata`, which the user can edit.
 * Authorization is an allowlist in ADMIN_EMAILS. An empty list denies everyone.
 */

export type AccessDecision =
    | { type: 'allow' }
    | { type: 'redirect'; pathname: string; search: string }
    | { type: 'deny'; status: 401 | 403; error: string };

export type AdminDataAccess =
    | { ok: true }
    | { ok: false; status: 401 | 403 | 503; error: string };

export const API_ROUTE_ACCESS = {
    'assessment/route.ts': 'admin',
    'analyze/route.ts': 'public',
    'report/route.ts': 'public',
    'send-email/route.ts': 'public',
    'questions/[service]/route.ts': 'public',
    'auth/login/route.ts': 'public',
    'auth/logout/route.ts': 'public',
} as const;

export type ApiRouteFile = keyof typeof API_ROUTE_ACCESS;

const AUTH_REQUIRED = 'Autenticación requerida';
const FORBIDDEN = 'No tienes permiso para ver estos diagnósticos';
const NOT_CONFIGURED = 'El panel de administración no está configurado';

export function parseAdminAllowlist(raw: string | undefined | null): Set<string> {
    if (!raw) return new Set();
    return new Set(
        raw
            .split(',')
            .map((entry) => entry.trim().toLowerCase())
            .filter((entry) => entry.length > 0)
    );
}

export function isAllowedAdmin(
    email: string | null | undefined,
    allowlistRaw: string | undefined | null
): boolean {
    if (!email) return false;
    const allowlist = parseAdminAllowlist(allowlistRaw);
    if (allowlist.size === 0) return false;
    return allowlist.has(email.trim().toLowerCase());
}

/** Email from a verified JWT payload. Ignores user_metadata on purpose. */
export function emailFromClaims(
    claims: { email?: unknown } | null | undefined
): string | null {
    const email = claims?.email;
    if (typeof email !== 'string') return null;
    const trimmed = email.trim();
    if (!trimmed.includes('@')) return null;
    return trimmed;
}

export function normalizePath(pathname: string): string {
    if (pathname.length > 1 && pathname.endsWith('/')) {
        return pathname.slice(0, -1);
    }
    return pathname || '/';
}

export function isAssessmentApi(pathname: string): boolean {
    const path = normalizePath(pathname);
    return path === '/api/assessment' || path.startsWith('/api/assessment/');
}

export function isAdminLogin(pathname: string): boolean {
    return normalizePath(pathname) === '/admin/login';
}

export function isAdminUi(pathname: string): boolean {
    const path = normalizePath(pathname);
    return path === '/admin' || path.startsWith('/admin/');
}

/**
 * Gate for middleware. Public respondent routes are allowed through.
 * /admin requires an allowlisted session. /api/assessment is denied
 * (401/403) instead of redirected, so clients keep a JSON response.
 */
export function decideAccess(
    pathname: string,
    email: string | null | undefined,
    allowlistRaw: string | undefined | null
): AccessDecision {
    const allowed = isAllowedAdmin(email, allowlistRaw);

    if (isAssessmentApi(pathname)) {
        if (!email) return { type: 'deny', status: 401, error: AUTH_REQUIRED };
        if (!allowed) return { type: 'deny', status: 403, error: FORBIDDEN };
        return { type: 'allow' };
    }

    if (isAdminLogin(pathname)) {
        if (allowed) return { type: 'redirect', pathname: '/admin', search: '' };
        return { type: 'allow' };
    }

    if (isAdminUi(pathname)) {
        if (allowed) return { type: 'allow' };
        if (email) {
            return { type: 'redirect', pathname: '/admin/login', search: 'error=forbidden' };
        }
        return { type: 'redirect', pathname: '/admin/login', search: '' };
    }

    return { type: 'allow' };
}

/**
 * Reject a service-role key that is missing or identical to the anon key.
 * The anon key is public; using it here would not be a privileged read.
 */
export function resolveServiceRoleKey(
    serviceRoleKey: string | undefined | null,
    anonKey: string | undefined | null
): string | null {
    const key = serviceRoleKey?.trim() ?? '';
    if (!key) return null;
    const anon = anonKey?.trim() ?? '';
    if (anon && key === anon) return null;
    return key;
}

/** App-level check used by the assessment route, independent of middleware. */
export function adminDataAccess(
    email: string | null | undefined,
    allowlistRaw: string | undefined | null,
    serviceRoleKey: string | undefined | null,
    anonKey?: string | undefined | null
): AdminDataAccess {
    if (!email) return { ok: false, status: 401, error: AUTH_REQUIRED };
    if (!isAllowedAdmin(email, allowlistRaw)) {
        return { ok: false, status: 403, error: FORBIDDEN };
    }
    if (!resolveServiceRoleKey(serviceRoleKey, anonKey)) {
        return { ok: false, status: 503, error: NOT_CONFIGURED };
    }
    return { ok: true };
}

export function apiFileToPath(relativeFile: string): string {
    const withoutRoute = relativeFile.replace(/\/route\.ts$/, '').replace(/route\.ts$/, '');
    return `/api/${withoutRoute.replace('[service]', 'bim')}`;
}
