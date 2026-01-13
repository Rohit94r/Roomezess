import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import NavHeader from '../components/NavHeader';
import SupabaseAuthListener from '../components/SupabaseAuthListener';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Roomezes - Student-Centric Digital Platform',
  description: 'A platform for campus living & daily services at Atharva College',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseAuthListener />
        <NavHeader />
        <div className="min-h-screen pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
