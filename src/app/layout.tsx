import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppModeProvider } from "@/components/providers/app-mode-provider";
import { AppToaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Big Feelings Toolkit",
  description: "Tools to help students reset, calm down, and refocus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="gradient-bg min-h-screen text-dark antialiased">
        <AppModeProvider>
          {children}
          <AppToaster />
        </AppModeProvider>
      </body>
    </html>
  );
}
