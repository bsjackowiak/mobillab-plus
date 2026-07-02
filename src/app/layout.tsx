import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { getAppBaseUrl } from "@/lib/app-url";
import { BRAND } from "@/lib/brand";
import { SITE_DEFAULT_DESCRIPTION } from "@/lib/seo";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: {
    default: `${BRAND.name} — Badania laboratoryjne`,
    template: `%s | ${BRAND.name}`,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  icons: {
    icon: "/brand/logo-mark.svg",
    apple: "/brand/logo-mark.svg",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: BRAND.name,
    title: `${BRAND.name} — Badania laboratoryjne`,
    description: SITE_DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${BRAND.name} — Badania laboratoryjne`,
    description: SITE_DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
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
