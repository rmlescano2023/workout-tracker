import type { Metadata } from "next";

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
        {children}
      </body>
    </html>
  );
}
