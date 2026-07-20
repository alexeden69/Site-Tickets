import './globals.css';
import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono, Oswald } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400','500','600'], variable: '--font-ibm-plex-mono' });

export const metadata: Metadata = {
  title: 'Guichet Dashboard',
  description: 'Tableau de bord de tickets séparé du bot Viagogo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${oswald.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
