import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
    API_ROUTE_ACCESS,
    adminDataAccess,
    apiFileToPath,
    decideAccess,
    emailFromClaims,
    isAllowedAdmin,
    parseAdminAllowlist,
    resolveServiceRoleKey,
} from './admin-auth.ts';

const srcRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir: string): string[] {
    const entries = readdirSync(dir);
    const files: string[] = [];
    for (const entry of entries) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            files.push(...walk(full));
        } else {
            files.push(full);
        }
    }
    return files;
}

describe('admin allowlist', () => {
    it('parses comma-separated emails and ignores blanks', () => {
        const list = parseAdminAllowlist('  Ana@IAC.com, ,bob@iac.com  ');
        assert.deepEqual([...list].sort(), ['ana@iac.com', 'bob@iac.com']);
    });

    it('fails closed when the allowlist is empty or missing', () => {
        assert.equal(isAllowedAdmin('ana@iac.com', ''), false);
        assert.equal(isAllowedAdmin('ana@iac.com', undefined), false);
        assert.equal(isAllowedAdmin('ana@iac.com', '   '), false);
        assert.equal(isAllowedAdmin(null, 'ana@iac.com'), false);
        assert.equal(isAllowedAdmin(undefined, 'ana@iac.com'), false);
    });

    it('matches email case-insensitively', () => {
        assert.equal(isAllowedAdmin('Ana@IAC.com', 'ana@iac.com, other@iac.com'), true);
        assert.equal(isAllowedAdmin('nope@iac.com', 'ana@iac.com'), false);
    });
});

describe('email claims', () => {
    it('uses the verified email claim and ignores user_metadata', () => {
        const claims = {
            email: 'Admin@IAC.com',
            user_metadata: { email: 'attacker@evil.com' },
        };
        assert.equal(emailFromClaims(claims), 'Admin@IAC.com');
        assert.equal(isAllowedAdmin(emailFromClaims(claims), 'admin@iac.com'), true);
        assert.equal(
            emailFromClaims({ user_metadata: { email: 'admin@iac.com' } } as { email?: unknown }),
            null
        );
    });

    it('rejects missing or malformed emails', () => {
        assert.equal(emailFromClaims(null), null);
        assert.equal(emailFromClaims({}), null);
        assert.equal(emailFromClaims({ email: 'not-an-email' }), null);
        assert.equal(emailFromClaims({ email: 12 }), null);
    });
});

describe('decideAccess', () => {
    const allow = 'admin@iac.com';

    it('lets anonymous visitors use public respondent routes', () => {
        for (const path of [
            '/',
            '/diagnostico',
            '/resultados',
            '/api/analyze',
            '/api/report',
            '/api/send-email',
            '/api/questions/bim',
            '/api/questions/ia',
            '/api/questions/plm',
            '/api/auth/login',
            '/api/auth/logout',
            '/admin/login',
        ]) {
            assert.equal(decideAccess(path, null, allow).type, 'allow', path);
        }
    });

    it('sends anonymous admin visitors to the login page', () => {
        assert.deepEqual(decideAccess('/admin', null, allow), {
            type: 'redirect',
            pathname: '/admin/login',
            search: '',
        });
        assert.deepEqual(decideAccess('/admin/', null, allow), {
            type: 'redirect',
            pathname: '/admin/login',
            search: '',
        });
    });

    it('rejects authenticated users who are not on the allowlist', () => {
        assert.deepEqual(decideAccess('/admin', 'other@iac.com', allow), {
            type: 'redirect',
            pathname: '/admin/login',
            search: 'error=forbidden',
        });
        assert.deepEqual(decideAccess('/api/assessment', 'other@iac.com', allow), {
            type: 'deny',
            status: 403,
            error: 'No tienes permiso para ver estos diagnósticos',
        });
    });

    it('denies the assessment API without a session', () => {
        const decision = decideAccess('/api/assessment/', null, allow);
        assert.equal(decision.type, 'deny');
        if (decision.type === 'deny') assert.equal(decision.status, 401);
        assert.equal(decideAccess('/api/assessment/export', null, allow).type, 'deny');
    });

    it('allows an allowlisted admin and skips the login page', () => {
        assert.equal(decideAccess('/admin', 'Admin@IAC.com', allow).type, 'allow');
        assert.equal(decideAccess('/api/assessment', 'admin@iac.com', allow).type, 'allow');
        assert.deepEqual(decideAccess('/admin/login', 'admin@iac.com', allow), {
            type: 'redirect',
            pathname: '/admin',
            search: '',
        });
    });

    it('locks the admin area when ADMIN_EMAILS is empty', () => {
        assert.equal(decideAccess('/admin', 'admin@iac.com', '').type, 'redirect');
        assert.equal(decideAccess('/api/assessment', 'admin@iac.com', ' ').type, 'deny');
    });
});

describe('service role key', () => {
    it('rejects a missing key and a copy of the anon key', () => {
        assert.equal(resolveServiceRoleKey(undefined, 'anon'), null);
        assert.equal(resolveServiceRoleKey('  ', 'anon'), null);
        assert.equal(resolveServiceRoleKey('anon', 'anon'), null);
        assert.equal(resolveServiceRoleKey(' service ', 'anon'), 'service');
    });

    it('requires an allowlisted session and a distinct service role key', () => {
        const cases: Array<[Parameters<typeof adminDataAccess>, number | 'ok']> = [
            [[null, 'a@b.co', 'service', 'anon'], 401],
            [['other@b.co', 'a@b.co', 'service', 'anon'], 403],
            [['a@b.co', 'a@b.co', undefined, 'anon'], 503],
            [['a@b.co', 'a@b.co', 'anon', 'anon'], 503],
            [['a@b.co', '', 'service', 'anon'], 403],
        ];
        for (const [args, status] of cases) {
            const result = adminDataAccess(...args);
            assert.equal(result.ok, false);
            if (!result.ok) assert.equal(result.status, status);
        }
        assert.deepEqual(adminDataAccess('a@b.co', 'a@b.co', 'service', 'anon'), { ok: true });
    });
});

describe('route inventory', () => {
    it('classifies every API route as public or admin', () => {
        const apiRoot = join(srcRoot, 'app', 'api');
        const found = walk(apiRoot)
            .filter((file) => file.endsWith('route.ts'))
            .map((file) => relative(apiRoot, file))
            .sort();

        assert.deepEqual(found, Object.keys(API_ROUTE_ACCESS).sort());

        for (const file of found) {
            const access = API_ROUTE_ACCESS[file as keyof typeof API_ROUTE_ACCESS];
            const path = apiFileToPath(file);
            const decision = decideAccess(path, null, 'admin@iac.com');
            if (access === 'admin') {
                assert.equal(decision.type, 'deny', path);
            } else {
                assert.equal(decision.type, 'allow', path);
            }
        }
    });

    it('matches the admin index, which Next.js 14 omits from /admin/:path*', () => {
        const middleware = readFileSync(join(srcRoot, 'middleware.ts'), 'utf8');
        assert.match(middleware, /matcher:\s*\[[^\]]*'\/admin'/);
    });

    it('has no server actions that could bypass the route guard', () => {
        const offenders = walk(srcRoot).filter((file) => {
            if (!/\.(ts|tsx)$/.test(file)) return false;
            const text = readFileSync(file, 'utf8');
            return /^\s*['"]use server['"]/m.test(text);
        });
        assert.deepEqual(offenders, []);
    });
});
