import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} — Badania laboratoryjne`,
  description: "Zamów badania laboratoryjne prywatnie, bez skierowania — na telefonie i komputerze.",
  icons: {
    icon: "/brand/logo-mark.svg",
    apple: "/brand/logo-mark.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: BRAND.colors.blue,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={`h-full ${plusJakarta.variable}`}>
      <body className="min-h-dvh font-sans">
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
