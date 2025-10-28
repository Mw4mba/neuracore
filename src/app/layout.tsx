"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/profile/Navbar";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { SessionProvider } from "@/lib/auth/session-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(saved);

    const observer = new MutationObserver(() => {
      const htmlTheme = document.documentElement.getAttribute(
        "data-theme"
      ) as "light" | "dark";
      if (htmlTheme) setTheme(htmlTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Show navbar unless on signup or signin routes
  const showNavbar =
    !pathname.includes("signup") &&
    !pathname.includes("signin") &&
    !pathname.includes("setup") &&
    !pathname.includes("admin/dashboard") &&
    !pathname.includes("login");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {showNavbar && <Navbar />}
          {children}
          <Toaster theme={theme} position="top-center" />
        </SessionProvider>
      </body>
    </html>
  );
}
