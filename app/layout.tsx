import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SV11B & SV11W SAR Tracker - Black Bolt & White Flare",
  description: "Track Pokemon TCG SV11B Black Bolt & SV11W White Flare Special Art Rare (SAR) card prices in real-time",
  keywords: "pokemon, tcg, sv11b, sv11w, black bolt, white flare, sar, special art rare, price tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
