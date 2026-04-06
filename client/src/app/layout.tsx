import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WaveTipz - Support Your Favorite Streamers",
  description: "WaveTipz is the premier platform for empowering creators. Send tips, support streamers, and grow the gaming broadcast ecosystem.",
  keywords: ["streaming", "gaming", "donations", "tips", "creators", "WaveTipz", "support streamers"],
  openGraph: {
    title: "WaveTipz - Empowering Creators",
    description: "Support your favorite content creators directly with WaveTipz. Join our community today.",
    url: "https://wavetipz.tech",
    siteName: "WaveTipz",
    images: [{
      url: "https://wavetipz.tech/contact-us.png",
      width: 1200,
      height: 630,
      alt: "WaveTipz Support"
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WaveTipz - Support Your Favorite Streamers",
    description: "WaveTipz is the premier platform for empowering creators.",
    images: ["https://wavetipz.tech/contact-us.png"],
  },
  robots: "index, follow",
};

import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
