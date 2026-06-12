import type { Metadata, Viewport } from "next";
import { Archivo, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CompareTray } from "@/components/compare/CompareTray";
import { CommandProvider } from "@/components/command/CommandProvider";
import { Toaster } from "@/components/ui/toaster";

// Three voices ("Refined Instrument", per the design-system header):
//   display   — Archivo, heavy/expanded cuts for broadcast-noir headlines & titles
//   grotesque — Hanken Grotesk, the calm UI/body workhorse
//   mono      — JetBrains Mono, reserved for numerals / tabular data
const display = Archivo({
  variable: "--font-display-face",
  subsets: ["latin"],
  display: "swap",
});
const grotesque = Hanken_Grotesk({
  variable: "--font-grotesque",
  subsets: ["latin"],
  display: "swap",
});
const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Squadron — AI Squad Builder & SBC Solver",
  description:
    "Build the strongest EA Sports FC 26 Ultimate Team. AI squad builder, cheapest SBC solutions, live chemistry, and a FUT coach in your pocket.",
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${grotesque.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="bg-app text-fg min-h-full flex flex-col">
        <CommandProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
          <CompareTray />
          <Toaster />
        </CommandProvider>
      </body>
    </html>
  );
}
