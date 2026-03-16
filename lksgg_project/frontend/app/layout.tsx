import "./globals.css";
import type { Metadata } from "next";
import AnalyticsProvider from "@/components/AnalyticsProvider";

export const metadata: Metadata = {
  title: "LkSGCompass – LkSG Compliance Software",
  description: "LkSG-konforme Lieferketten-Due-Diligence für deutsche Unternehmen. Risikobewertung, BAFA-Berichterstattung und Beschwerdemanagementsystem in einer Plattform.",
  keywords: ["LkSG", "Lieferkettensorgfaltspflichtengesetz", "BAFA", "Compliance", "Supply Chain", "Due Diligence"],
  authors: [{ name: "LkSGCompass" }],
  metadataBase: new URL(process.env.PUBLIC_APP_URL || "https://lksgcompass.de"),
  openGraph: {
    title: "LkSGCompass – LkSG Compliance Software",
    description: "Risikobewertung, BAFA-Berichte und Whistleblowing-Portal in einer Plattform.",
    type: "website",
    locale: "de_DE",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><AnalyticsProvider />{children}</body>
    </html>
  );
}
