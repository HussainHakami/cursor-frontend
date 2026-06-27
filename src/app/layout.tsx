import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "متتبع الاستثمارات - السوق السعودي",
  description: "تطبيق شامل لتتبع استثماراتك في السوق السعودي (تداول)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${arabicFont.variable} h-full`}>
      <body className="min-h-full bg-gray-50 font-[family-name:var(--font-arabic)] antialiased dark:bg-gray-950">
        <Sidebar />
        <main className="lg:mr-64">
          <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
