import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell";
import { NO_FLASH_SCRIPT } from "@/components/theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MarketDesk — market intelligence terminal",
  description:
    "Adaptive factor scoring, a calibrated ML pattern model, technical signals, and an allocation engine for the US market. Not financial advice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
