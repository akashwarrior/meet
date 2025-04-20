import type { Metadata } from "next";
import localFont from 'next/font/local'
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const myFont = localFont({
  src: [
    {
      weight: '400',
      path: '../fonts/regular.woff2',
    },
    {
      weight: '700',
      path: '../fonts/bold.woff2',
    },
  ],
})

export const metadata: Metadata = {
  icons: './icon.svg',
  title: "MeetSync - Professional Video Conferencing",
  description: "Connect securely with end-to-end encryption. Host video meetings, share your screen, and collaborate with just a few clicks.",
  keywords: "video conferencing, online meetings, screen sharing, collaboration, end-to-end encryption, secure communication",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={myFont.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html >
  );
}
