import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const myFont = localFont({
  src: [
    {
      weight: "400",
      path: "../fonts/regular.woff2",
    },
    {
      weight: "700",
      path: "../fonts/bold.woff2",
    },
  ],
  preload: true,
});

export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: "Meet - Professional Video Conferencing",
  description:
    "Connect securely with end-to-end encryption. Host video meetings and collaborate with just a few clicks.",
  keywords:
    "video conferencing, online meetings, collaboration, end-to-end encryption, secure communication",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={myFont.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster richColors theme="light" />
      </body>
    </html>
  );
}
