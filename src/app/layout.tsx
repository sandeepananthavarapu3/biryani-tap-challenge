import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavigationProvider } from "@/components/providers/NavigationProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Biryani Tap Challenge",
  description: "Tap the chicken. Win the biryani.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col spice-page text-white antialiased font-sans">
        <NavigationProvider>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
