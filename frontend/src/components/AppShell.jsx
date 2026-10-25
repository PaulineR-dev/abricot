"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const hideLayout = ["/login", "/signup"].includes(pathname);
  return (
    <AuthProvider>
      {hideLayout ? children : <><Header /><main style={{ flex: 1 }}>{children}</main><Sidebar /></>}
    </AuthProvider>
  );
}