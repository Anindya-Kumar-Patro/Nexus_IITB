import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Nexus IITB",
  description: "Find co-founders and join ventures across IIT Bombay.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}