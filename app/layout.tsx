import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RushBox — Fast Delivery & Transport",
  description:
    "Groceries and medicine in 30 minutes from our own dark stores, plus fair-priced transport for cargo, parcels and shopping errands.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RushBox",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2c3e50",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-ink-900">
        <StoreProvider>{children}</StoreProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
