import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SV11B SAR Tracker - Black Bolt Special Art Rare Cards",
  description: "Track Pokemon TCG SV11B Black Bolt Special Art Rare (SAR) card prices in real-time",
  keywords: "pokemon, tcg, sv11b, black bolt, sar, special art rare, price tracker",
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
