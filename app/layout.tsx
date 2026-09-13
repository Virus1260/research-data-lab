import type { Metadata } from "next";
import "./globals.css";
import { NarratorProvider } from "@/components/narrator/NarratorContext";
import { NarratorDeck } from "@/components/narrator/NarratorDeck";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeScript } from "@/components/layout/ThemeScript";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen flex flex-col antialiased" style={{ backgroundColor: 'var(--bg)', color: 'var(--ink-secondary)' }}>
        <ThemeProvider>
          <NarratorProvider>
            <Header />
            <CommandPalette />
            <main className="flex-1 pb-28">{children}</main>
            <NarratorDeck />
          </NarratorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
