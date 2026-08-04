"use client";

import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Music2,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeSelector } from "./ThemeSelector";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/add", label: "Add Concert", icon: PlusCircle },
  { href: "/concerts", label: "My Concerts", icon: Music2 },
];

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-base-300/60 bg-base-100/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
                Concert Cost Tracker
              </h1>
              <p className="text-sm opacity-70 mt-1 max-w-xl">
                Track what you spend at shows - and how much fun you had.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <ThemeSelector />
              <div className="badge badge-outline badge-lg max-w-[14rem] truncate">
                {email}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-1"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>

          <nav className="tabs tabs-box bg-base-200/70 p-1 w-full sm:w-fit flex flex-wrap">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`tab gap-2 ${active ? "tab-active" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
