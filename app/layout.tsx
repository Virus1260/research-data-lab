import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NarratorProvider } from "@/components/narrator/NarratorContext";
import { NarratorDeck } from "@/components/narrator/NarratorDeck";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { MasterBookmarkDrawer } from "@/components/layout/MasterBookmarkDrawer";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Research Data • Interactive Engineering Lab",
  description:
    "An interactive digital laboratory that transforms dense engineering research dossiers into visual, interactive, narrated experiences.",
  keywords: ["freeze dryer", "lyophilizer", "engineering", "research", "interactive", "AFD", "Hosokawa"],
  openGraph: {
    title: "Research Data • Interactive Engineering Lab",
    description: "Transform dense engineering research into interactive, narrated, explorable experiences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen flex flex-col antialiased lab-grid-bg font-sans">
        <ThemeProvider>
          <NarratorProvider>
            <Header />
            <CommandPalette />
            <main className="flex-1 pb-28">{children}</main>
            <NarratorDeck />
            <MasterBookmarkDrawer />
          </NarratorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
