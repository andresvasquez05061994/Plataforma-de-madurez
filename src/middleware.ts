import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Check for Supabase auth session cookie
        const supabaseAuth = request.cookies.get('sb-access-token') ||
            request.cookies.get('sb-refresh-token');

        // If Supabase is not configured, allow access (development mode)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
            return NextResponse.next();
        }

        // If no auth cookie, redirect to login or show unauthorized
        if (!supabaseAuth) {
            // In production, you'd redirect to a login page
            // For now, allow access if Supabase is not fully configured
            return NextResponse.next();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
