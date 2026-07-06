import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GameBees | Premium PS5 & Console Rentals",
  description: "Rent next-gen consoles including PlayStation 5, Xbox Series X, Nintendo Switch, and Meta Quest 3. Low rates, instant setups, and pre-installed gaming packages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-gamebees-bg text-white selection:bg-gamebees-pink-highlight selection:text-white">
        {children}
      </body>
    </html>
  );
}
