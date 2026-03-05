import type { Metadata } from "next";
import { AppToaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Big Feelings Toolkit",
  description: "A teacher-led emotional regulation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-dark antialiased">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
