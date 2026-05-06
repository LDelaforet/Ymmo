"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface NavItem {
    href: string;
    label: string;
    auth?: boolean;
    agent?: boolean;
    admin?: boolean;
}

const navItems: NavItem[] = [
    { href: "/", label: "Browse" },
    { href: "/properties", label: "Properties" },
    { href: "/dashboard", label: "Client Area", auth: true },
    { href: "/agent", label: "Agent Office", agent: true },
    { href: "/admin", label: "Admin", admin: true },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAgent, isAdmin, logout } = useAuth();
    const [open, setOpen] = useState(false);

    function handleLogout() {
        logout();
        setOpen(false);
        router.push("/");
    }

    const visibleItems = navItems.filter((item) => {
        if (item.auth && !user) return false;
        if (item.agent && !isAgent) return false;
        if (item.admin && !isAdmin) return false;
        return true;
    });

    return (
        <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                        <img src="/backend-ymmo/assets/logo.png" alt="logo" className="h-full w-full" />
                        <span>
                            <span className="block text-xl font-bold text-stone-950">Ymmo</span>
                            <span className="block text-xs font-medium uppercase tracking-wide text-stone-500">
                                Real estate
                            </span>
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setOpen((current) => !current)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-stone-300 text-stone-800 lg:hidden"
                        aria-expanded={open}
                        aria-label="Open navigation"
                    >
                        <span className="grid gap-1.5">
                            <span className="h-0.5 w-5 bg-current" />
                            <span className="h-0.5 w-5 bg-current" />
                            <span className="h-0.5 w-5 bg-current" />
                        </span>
                    </button>
                </div>

                <div
                    className={`mt-4 flex-col gap-2 lg:mt-0 lg:flex lg:flex-row lg:items-center lg:justify-between ${open ? "flex" : "hidden"
                        }`}
                >
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                        {visibleItems.map((item) => {
                            const active = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${active
                                        ? "bg-stone-950 text-white"
                                        : "text-stone-700 hover:bg-stone-100"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-2 border-t border-stone-200 pt-3 lg:flex-row lg:items-center lg:border-t-0 lg:pt-0">
                        {user ? (
                            <>
                                <span className="text-sm text-stone-600 lg:px-2">
                                    {user.first_name} - {user.role}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setOpen(false)}
                                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
