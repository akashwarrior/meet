import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const isAuthenticated = request.cookies.get("next-auth.session-token")?.value || null;
    
    if (!isAuthenticated) {
        return NextResponse.next()
    } else {
        const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/';
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = callbackUrl;
        redirectUrl.searchParams.delete('callbackUrl')
        return NextResponse.redirect(redirectUrl)
    }
}

export const config = {
    matcher: '/auth/:path*',
}