import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Outfit } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";

/**
 * Barlow Condensed — athletic, condensed display font for headings & logo
 */
const barlowCondensed = Barlow_Condensed({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

/**
 * Outfit — refined, modern body font with just enough personality
 */
const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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
      <body className={`${barlowCondensed.variable} ${outfit.variable} antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
