import type { Metadata } from "next";
import { Inter } from "next/font/google"
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Remote Share",
  description: "Connect securely with end-to-end encryption. Share your screen, transfer files, and enable remote control with just a few clicks.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
