"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Users" },
  { href: "/products", label: "Items" },
  { href: "/categories", label: "Categories" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="w-64 shrink-0">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold">Admin Panel</div>
            <div className="mt-4 space-y-1">
              {nav.map((i) => {
                const active = pathname === i.href;
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className={
                      "block rounded-lg px-3 py-2 text-sm " +
                      (active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100")
                    }
                  >
                    {i.label}
                  </Link>
                );
              })}
            </div>

            <button
              className="mt-6 w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
              onClick={() => {
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-xl border bg-white p-5 shadow-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
