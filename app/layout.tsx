import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-clash",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "JOLAGREEN23 | Official Site",
  description: "Official website of JOLAGREEN23 - French rap artist. New album 'Métal' out now.",
  keywords: ["JOLAGREEN23", "rap français", "drill", "333", "Métal", "GOTY EDITION"],
  openGraph: {
    title: "JOLAGREEN23 | Official Site",
    description: "French rap artist from Bois-Colombes. 971k+ monthly listeners.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${syne.variable}`}>
      <body className="font-body noise-overlay">
        {children}
      </body>
    </html>
  );
}
