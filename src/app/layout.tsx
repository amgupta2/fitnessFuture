import type { Metadata, Viewport } from "next";
import { Syne, Nunito } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";

/**
 * Syne — bold, geometric, editorial display font for headings & logo.
 * Distinctly modern, far from typical "gym-bro" condensed athleticism.
 */
const syne = Syne({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

/**
 * Nunito — friendly, rounded, highly readable body font.
 * Warm and approachable without being childish.
 */
const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "UniFit",
  description: "Where training data, intelligence, and coaching merge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${syne.variable} ${nunito.variable} antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
