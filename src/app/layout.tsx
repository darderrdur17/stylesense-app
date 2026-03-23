import type { Metadata, Viewport } from "next";
import type { Session } from "next-auth";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { auth } from "@/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F8F9FC",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "StyleSense AI | Your AI-Powered Style Companion",
  description:
    "Context-aware AI wardrobe assistant that uses past outfit data, weather, and location to recommend future outfits. Plan travel wardrobes, match styles, and dress smarter.",
  keywords: [
    "AI wardrobe",
    "outfit planner",
    "style assistant",
    "weather fashion",
    "travel packing",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session: Session | null = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
