import type { Metadata, Viewport } from "next";
import { Courier_Prime } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CompareTray } from "@/components/compare/CompareTray";

// Typewriter face (closest free match to "Secret Service Typewriter").
// Drop the real .woff2 into /public/fonts and switch to next/font/local to use the exact one.
const typewriter = Courier_Prime({
  variable: "--font-typewriter",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
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
      className={`${typewriter.variable} h-full antialiased`}
    >
      <body className="bg-app text-fg min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <CompareTray />
      </body>
    </html>
  );
}
