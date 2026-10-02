import { NextResponse, type NextRequest } from 'next/server';
import { decideAccess } from '@/lib/admin-auth';
import { copySession, readSessionEmail } from '@/lib/supabase/session';

export async function middleware(request: NextRequest) {
    const { response, email } = await readSessionEmail(request);
    const decision = decideAccess(request.nextUrl.pathname, email, process.env.ADMIN_EMAILS);

    if (decision.type === 'allow') {
        return response;
    }

    if (decision.type === 'redirect') {
        const url = request.nextUrl.clone();
        url.pathname = decision.pathname;
        url.search = decision.search ? `?${decision.search}` : '';
        return copySession(response, NextResponse.redirect(url));
    }

    const denied = NextResponse.json(
        { error: decision.error },
        {
            status: decision.status,
            headers: { 'Cache-Control': 'private, no-store' },
        }
    );
    return copySession(response, denied);
}

export const config = {
    matcher: ['/admin/:path*', '/api/assessment', '/api/assessment/:path*'],
};
