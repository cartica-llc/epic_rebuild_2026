import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header/Header';
import { Footer } from '@/components/footer';
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
    title: 'EPIC Database | California Public Utilities Commission',
    description: 'California Public Utilities Commission EPIC Database',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={cn('h-full antialiased', inter.variable)}>
        <body className="min-h-full flex flex-col">
        <SessionProvider>
            <Header />
            <main className="flex-1 ">{children}</main>
            <Footer />
        </SessionProvider>
        </body>
        </html>
    );
}