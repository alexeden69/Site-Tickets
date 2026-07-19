import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guichet Dashboard',
  description: 'Tableau de bord de tickets séparé du bot Viagogo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
