import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "lainWRLD",
    template: "%s | lainWRLD",
  },
  description: "개발, 투자, AI에 대한 생각을 기록하는 개인 블로그입니다.",
  openGraph: {
    title: "lainWRLD",
    description: "개발, 투자, AI에 대한 생각을 기록하는 개인 블로그입니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
