import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { Roboto, Roboto_Mono } from "next/font/google";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Providers from '@/components/providers/Providers';
import type { Metadata } from 'next';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'MySpace Admin',
  description: 'MySpace Admin Dashboard',
  icons: {
    // Standard favicon
    icon: '/favicon.ico?v=3',

    // Option 2: Use custom name from public folder
    // icon: '/my-custom-icon.png?v=2',

    // Option 3: Multiple sizes for better quality
    // icon: [
    //   { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    //   { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    // ],

    // Apple touch icon
    // apple: '/apple-icon.png',
  },
};

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["vietnamese"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["vietnamese"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${robotoSans.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <Providers>
            <SidebarProvider>{children}</SidebarProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
