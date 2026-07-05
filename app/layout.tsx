import type { Metadata } from "next";
import Link from "next/link";

// This file is required by Next.js's "App Router". Every page you create
// under app/ gets wrapped in whatever's returned here - think of it like
// a master template (nav bar, global CSS, etc).

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
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "2rem" }}>
        <nav style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid #333", paddingBottom: "1rem" }}>
          <Link href="/">Today</Link>
          <Link href="/manage/exercises">Manage Exercises</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}