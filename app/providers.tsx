'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from "next-auth/react";
import type { Session } from 'next-auth';

export function Providers({ children, session }: {
    children: React.ReactNode;
    session: Session | null;
}) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}