import { Orbitron } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const orbitron = Orbitron({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Masks of the Void: Infinity | Base Backgrounds',
  description: 'Mint your Masks of the Void background NFTs',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={orbitron.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
