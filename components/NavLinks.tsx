"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Today", icon: "☀" },
  { href: "/manage/workouts", label: "Workouts", icon: "🏋" },
  { href: "/manage/schedule", label: "Schedule", icon: "🗓" },
  { href: "/manage/exercises", label: "Exercises", icon: "＋" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

// Desktop: horizontal tab strip in the header.
export function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden sm:flex items-center gap-1">
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`font-display uppercase tracking-wide text-xs px-3 py-2 rounded-sm transition-colors ${
              active ? "bg-surface-2 text-ink" : "text-ink-dim hover:text-ink hover:bg-surface-2/60"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Mobile: fixed bottom tab bar, thumb-reachable at the gym.
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface border-t border-line flex pb-[env(safe-area-inset-bottom)]">
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 font-display uppercase tracking-wide text-[10px] transition-colors ${
              active ? "text-gym" : "text-ink-faint"
            }`}
          >
            <span aria-hidden className="text-base leading-none">
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}