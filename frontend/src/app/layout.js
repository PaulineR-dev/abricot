"use client";

import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Pages qui doivent être SANS header/sidebar
  const noLayoutPages = ["/login", "/signup"];
  const hideLayout = noLayoutPages.includes(pathname);

  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
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
