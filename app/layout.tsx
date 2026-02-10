import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pokemon TCG Rare Card Tracker - SV11B & SV11W",
  description: "Track Pokemon TCG SV11B Black Bolt & SV11W White Flare Special Art Rare (SAR), Art Rare (AR), and Super Rare (SR) card prices with advanced filtering",
  keywords: "pokemon, tcg, sv11b, sv11w, black bolt, white flare, sar, ar, sr, special art rare, art rare, super rare, price tracker",
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
