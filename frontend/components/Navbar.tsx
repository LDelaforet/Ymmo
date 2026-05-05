"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
    { href: "/", label: "Browse" },
    { href: "/properties", label: "Properties" },
    { href: "/dashboard", label: "Client Area", auth: true },
    { href: "/agent", label: "Agent Office", agent: true },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAgent, logout } = useAuth();

    function handleLogout() {
        logout();
        router.push("/");
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-700 text-lg font-bold text-white">
                        Y
                    </span>
                    <span>
                        <span className="block text-xl font-bold text-stone-950">Ymmo</span>
                        <span className="block text-xs font-medium uppercase tracking-wide text-stone-500">
                            Real estate
                        </span>
                    </span>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                    {navItems.map((item) => {
                        if (item.auth && !user) return null;
                        if (item.agent && !isAgent) return null;
                        const active = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                                    active
                                        ? "bg-stone-950 text-white"
                                        : "text-stone-700 hover:bg-stone-100"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}

                    {user ? (
                        <div className="flex items-center gap-3 pl-2">
                            <span className="hidden text-sm text-stone-600 sm:inline">
                                {user.first_name} · {user.role}
                            </span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
