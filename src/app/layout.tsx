import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: "Meet",
  description:
    "Production-grade video meetings built with Next.js, LiveKit, Prisma, and Better Auth.",
  keywords: [
    "video conferencing",
    "online meetings",
    "livekit",
    "next.js",
    "team collaboration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
