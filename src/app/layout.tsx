import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#020408',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'TERRA — 3D Planetary Explorer & Digital Twin',
  description:
    'Awwwards-caliber real-time 3D Earth Atlas and planetary telemetry workstation featuring live USGS seismic activity, ISS tracking, Natural Earth vectors, and spatial HUD.',
  keywords: [
    'Digital Twin',
    '3D Earth',
    'WebGL',
    'Three.js',
    'USGS Earthquakes',
    'ISS Tracking',
    'Planetary Atlas',
    'Next.js 15',
  ],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full bg-void">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans h-full w-full bg-void text-slate-100 antialiased overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
