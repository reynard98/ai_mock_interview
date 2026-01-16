import type { Metadata } from "next";
import { IBM_Plex_Sans_JP } from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";

const ibmPlexSansJP = IBM_Plex_Sans_JP({
    variable: "--font-ibm-plex-sans-jp",
    subsets: ["japanese ", "latin"],
    weight: ["300", "400", "500", "600", "700"],
});



export const metadata: Metadata = {
  title: "Jobi",
  description: "an AI powered platform for preparing for mock interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${ibmPlexSansJP.className} antialiased pattern`}
      >
        {children}
        <Toaster/>
      </body>
    </html>
  );
}
