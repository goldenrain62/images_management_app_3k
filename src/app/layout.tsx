import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { Roboto, Roboto_Mono } from "next/font/google";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Providers from '@/components/providers/Providers';

const outfit = Outfit({
  subsets: ["latin"],
});

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
