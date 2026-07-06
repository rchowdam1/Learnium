"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Home,
  GraduationCap,
  Repeat,
  Trophy,
  CircleUser,
  BookOpen,
} from "lucide-react";
import Profile from "@/app/components/misc/Profile";
import { StatusChrome } from "./StatusChrome";

const TABS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Learn", href: "/learn", icon: GraduationCap },
  { label: "Review", href: "/review", icon: Repeat },
  { label: "Leagues", href: "/leagues", icon: Trophy },
  { label: "Profile", href: "/profile", icon: CircleUser },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("/api/get-username");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUsername(data.username);
          }
        }
      } catch {
        // Silently catch error to prevent UI crash
      }
    };
    fetchUsername();
  }, []);

  const signOut = async () => {
    try {
      const response = await fetch("/api/logout");
      if (!response.ok) {
        toast.error("Could not sign out");
        return;
      }
      // Redirect to landing / login
      window.location.href = "/login";
    } catch {
      toast.error("Could not sign out");
    }
  };

  return (
    <>
      {/* Desktop sticky top bar */}
      <header className="hidden md:flex sticky top-0 z-40 h-16 w-full items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center space-x-8">
          <Link
            href="/dashboard"
            className="focus-ring flex items-center space-x-3 rounded-xl"
          >
            <BookOpen className="h-8 w-8 text-brand" />
            <span className="text-heading text-xl text-primary font-bold">
              Learnium
            </span>
          </Link>
          <nav aria-label="Primary" className="flex items-center space-x-2">
            {TABS.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring flex items-center gap-2 rounded-xl px-4 py-2 text-label text-sm transition-all duration-200 ${
                    active
                      ? "bg-surface font-semibold text-primary"
                      : "text-muted hover:bg-surface hover:text-primary"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? "text-brand" : "text-muted"}`}
                    fill={active ? "currentColor" : "none"}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div id="chrome-slot" className="flex items-center gap-3">
          <StatusChrome className="hidden md:flex" />
          {username && (
            <span className="hidden lg:inline text-body text-sm text-muted">
              Welcome, {username}
            </span>
          )}
          <Profile
            onSignOut={signOut}
            onViewProfile={() => console.log("Viewing profile...")}
          />
        </div>
      </header>

      {/* Mobile fixed bottom bar */}
      <nav
        aria-label="Primary"
        className="flex md:hidden fixed bottom-0 left-0 z-40 w-full h-16 items-center justify-around border-t border-border bg-surface-raised px-2 pb-safe"
      >
        {TABS.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`focus-ring flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-xs transition-all duration-200 ${
                active
                  ? "bg-surface font-semibold text-primary"
                  : "text-muted hover:bg-surface hover:text-primary"
              }`}
              style={{ minWidth: "4.5rem" }}
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-brand" : "text-muted"}`}
                fill={active ? "currentColor" : "none"}
              />
              <span className="text-label text-[10px] sm:text-xs">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile status bar */}
      <div className="flex md:hidden fixed bottom-16 left-0 z-40 w-full h-10 items-center justify-around border-t border-border bg-surface px-4 py-1.5">
        <StatusChrome className="flex w-full justify-around text-xs" />
      </div>
    </>
  );
}
