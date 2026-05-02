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
  title: "WaveTips - Support Your Favorite Streamers",
  description: "WaveTips is the premier platform for empowering creators. Send tips, support streamers, and grow the gaming broadcast ecosystem.",
  keywords: ["streaming", "gaming", "donations", "tips", "creators", "WaveTips", "support streamers"],
  openGraph: {
    title: "WaveTips - Empowering Creators",
    description: "Support your favorite content creators directly with WaveTips. Join our community today.",
    url: "https://WaveTips.tech",
    siteName: "WaveTips",
    images: [{
      url: "https://WaveTips.tech/contact-us.png",
      width: 1200,
      height: 630,
      alt: "WaveTips Support"
    }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WaveTips - Support Your Favorite Streamers",
    description: "WaveTips is the premier platform for empowering creators.",
    images: ["https://WaveTips.tech/contact-us.png"],
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
