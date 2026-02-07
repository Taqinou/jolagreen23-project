import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk, Syne } from "next/font/google";
import CustomCursor from "./components/CustomCursor";
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
  title: "jola.",
  description:
    "Official website of JOLAGREEN23 - French rap artist. New album 'Métal' out now.",
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", type: "image/x-icon" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      {
        url: "/favicon/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: [{ url: "/favicon/favicon.ico" }],
  },
  keywords: [
    "JOLAGREEN23",
    "rap français",
    "drill",
    "333",
    "Métal",
    "GOTY EDITION",
  ],
  openGraph: {
    title: "JOLAGREEN23 | Official Site",
    description:
      "French rap artist from Bois-Colombes. 971k+ monthly listeners.",
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
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/@react-grab/opencode/dist/client.global.js"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className="font-body">
        <CustomCursor />
        {children}
        <div aria-hidden="true" className="bottom-gaussian-blur" />
      </body>
    </html>
  );
}
