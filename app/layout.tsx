import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Sports Sync AI — Goa State Sports Department",
  description:
    "Official sports governance platform of the Goa State Government. Manage athlete registrations, tournaments, venues, and analytics.",
  keywords: "Goa sports, tournament management, athlete registration, government sports portal",
  openGraph: {
    title: "Sports Sync AI",
    description: "Goa Government Sports Governance Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
