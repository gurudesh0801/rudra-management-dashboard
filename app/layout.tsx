import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FontProvider } from "@/components/font-provider/font-provider";
import { AlertToaster } from "@/components/ui/alert-toaster"; // Import the AlertToaster
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
  title: "Rudra Arts and Handicrafts",
  description: "Invoice management system for Rudra Arts and Handicrafts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FontProvider>
          {children}
          <AlertToaster /> {/* Add the AlertToaster here */}
        </FontProvider>
      </body>
    </html>
  );
}
