import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Header from "@/components/header";
import { cn } from "@/lib/utils";
import { NavigationProvider } from "@/providers/navigation-provider";
import NextAuthSessionProvider from "@/providers/next-auth-session-provider";
import ReactQueryProvider from "@/providers/react-query-provider";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.schoollink.com'),
  title: {
    template: '스쿨링크, %s',
    default: '대한민국 늘봄학교 CRM 표준',
  },
  applicationName: '스쿨링크',
  keywords: ['스쿨링크', '대한민국', '늘봄학교', 'CRM 표준', '코디마스터', '디비디비스쿨'],
  description: '스쿨링크, 극강의 할인혜택 산지직송 온라인 플랫폼',
  creator: "제플 덕후들",
  publisher: "제플",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '스쿨링크',
    description: '스쿨링크, 대한민국 늘봄학교 CRM 표준',
    url: 'https://www.schoollink.com',
    images: [
      {
        url: 'https://cdn.schoollink.com/icons/logo.png',
        alt: '스쿨링크 로고',
      },
    ],
  },
  twitter: {
    title: '스쿨링크',
    description: '스쿨링크, 대한민국 늘봄학교 CRM 표준',
    creator: '@jinseok',
    images: [
      {
        url: 'https://cdn.schoollink.com/icons/logo.png',
        alt: '스쿨링크 로고',
      },
    ],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'bg-background',
        inter.variable,
        geistSans.variable,
        geistMono.variable,
      )}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="와코" />
        <meta property="og:title" content="와코" />
        <meta property="og:description" content="극강의 할인 산지직송 온라인 플랫폼" />
        <meta property="og:url" content="schoollink.com" />
        <meta property="og:image" content="https://cdn.schoollink.com/icons/logo.png" />
        <meta name="twitter:image" content="https://cdn.schoollink.com/icons/logo.png" />
        <meta name="naver-site-verification" content="1577b5f30601e7474f41d8e830414148f1140ee3" />
        <meta name="apple-mobile-web-app-title" content="와코" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body
        className={cn(inter.className, 'antialiased')}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <NextAuthSessionProvider session={session}>
            <ReactQueryProvider>
              <NavigationProvider>
                <div className="relative">
                  <div className="w-full mx-auto flex flex-col">
                    <Header />
                    <main className="min-h-screen container py-8">{children}</main>
                  </div>
                </div>
                <Toaster position="top-right" />
              </NavigationProvider>
            </ReactQueryProvider>
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
