"use client";

import { Geist, Geist_Mono, Inter, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const noLayoutPages = ["/login", "/signup"];
  const hideLayout = noLayoutPages.includes(pathname);

  return (
    <html 
      lang="fr" 
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${manrope.variable}`}
    >
      <body>
        <AuthProvider>
          {hideLayout ? (
            children
          ) : (
            <>
              <Header />

              <main style={{ flex: 1 }}>
                {children}
              </main>

              <Sidebar />
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}