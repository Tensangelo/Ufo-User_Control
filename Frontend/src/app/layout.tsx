import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { AppProviders } from "@/shared/components/AppProviders";
import { SiteFooter } from "@/shared/components/SiteFooter";
import "../styles/globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ufo - User Control",
  description: "Directorio de usuarios",
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): ReactNode {
  return (
    <html lang="es">
      <body
        className={`${instrument.variable} flex min-h-dvh flex-col bg-paper font-sans text-ink antialiased`}
      >
        <AppProviders>
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
