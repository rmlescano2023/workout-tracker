import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import { TopNav, BottomNav } from "@/components/NavLinks";
import "./globals.css";

// This file is required by Next.js's "App Router". Every page you create
// under app/ gets wrapped in whatever's returned here - think of it like
// a master template (nav bar, global CSS, etc).

// Oswald - condensed, stenciled feel, used for headings/labels/numbers.
// Inter - the body workhorse, quiet so it doesn't compete with the display face.
const oswald = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Workout Tracker",
  description: "Gym + running tracker with progressive overload",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-bg text-ink pb-16 sm:pb-0">
        <header className="border-b border-line bg-surface/60 sticky top-0 z-10 backdrop-blur">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <span className="font-display uppercase tracking-widest text-sm text-ink">
              Workout <span className="text-gym">—</span> Tracker
            </span>
            <TopNav />
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">{children}</div>

        <BottomNav />
      </body>
    </html>
  );
}