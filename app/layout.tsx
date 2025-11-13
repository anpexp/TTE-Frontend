import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/dev/Providers";
import { FavoritesProvider } from "@/components/context/FavoritesContext";
import AppShell from "@/components/dev/AppShell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechTrend Emporium",
  description: "Storefront",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <FavoritesProvider>
            <AppShell>{children}</AppShell>
          </FavoritesProvider>
        </Providers>
      </body>
    </html>
  );
}
