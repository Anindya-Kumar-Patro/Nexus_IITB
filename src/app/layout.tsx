// @ts-nocheck
import type { Metadata } from "next";
import { NavigationProgress } from "@/components/navigation-progress";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Nexus IITB",
    template: "%s · Nexus IITB",
  },
  description: "Find co-founders, discover ventures, and build your startup at IIT Bombay.",
  metadataBase: new URL("https://nexus-iitb.vercel.app"),
  openGraph: {
    title: "Nexus IITB",
    description: "Find co-founders, discover ventures, and build your startup at IIT Bombay.",
    siteName: "Nexus IITB",
    type: "website",
    url: "https://nexus-iitb.vercel.app",
  },
  twitter: {
    card: "summary",
    title: "Nexus IITB",
    description: "Find co-founders, discover ventures, and build your startup at IIT Bombay.",
  },
  keywords: ["IIT Bombay", "startup", "co-founder", "IITB", "venture", "entrepreneur"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans" suppressHydrationWarning>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
