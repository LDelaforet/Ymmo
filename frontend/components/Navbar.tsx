"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
const LOGO_SRC = "/logo.png";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAgent, isAdmin, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    function handleLogout() {
        logout();
        setOpen(false);
        setProfileOpen(false);
        router.push("/");
    }

    const visibleItems = navItems.filter((item) => {
        if (item.auth && !user) return false;
        if (item.agent && !isAgent) return false;
        if (item.admin && !isAdmin) return false;
        return true;
    });

    const initials = user
        ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U"
        : "G";

    return (
        <nav className="sticky top-0 z-50 border-b border-[#e5d8c8] bg-[#fffaf3]/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                <div className="grid grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-3">
                    <Link href="/" className="group justify-self-start" onClick={() => setOpen(false)}>
                        <Image src={LOGO_SRC} alt="Ymmo logo" width={140} height={75} className="h-18 w-auto object-contain" />
                    </Link>

                    <div className="hidden items-center justify-center gap-2 lg:flex">
                        {visibleItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                        active
                                            ? "bg-[#8b6b4f] text-white shadow-sm"
                                            : "text-[#5a4738] hover:bg-[#efe4d6] hover:text-[#2f241f]"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="hidden justify-self-end lg:block">
                        {user ? (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen((current) => !current)}
                                    className="grid h-15 w-15 place-items-center rounded-full border border-[#cdb79f] bg-[#8b6b4f] text-md font-bold text-white shadow-sm"
                                >
                                    {initials}
                                </button>
                                {profileOpen ? (
                                    <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-md border border-[#e5d8c8] bg-[#fffaf3] shadow-lg">
                                        <div className="border-b border-[#efe4d6] px-4 py-3">
                                            <p className="text-sm font-bold text-[#2f241f]">{user.first_name} {user.last_name}</p>
                                            <p className="text-xs text-[#7a6553]">{user.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <Link
                                                href="/profile"
                                                onClick={() => setProfileOpen(false)}
                                                className="block rounded-md px-3 py-2 text-sm font-medium text-[#5a4738] hover:bg-[#efe4d6]"
                                            >
                                                User profile
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <Link href="/login" className="rounded-full bg-[#8b6b4f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#775a43]">
                                Login
                            </Link>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen((current) => !current)}
                        className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-md border border-[#d9c7b3] bg-[#fffaf3] text-[#5a4738] shadow-sm lg:hidden"
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

                <div className={`mt-3 flex-col gap-2 rounded-lg border border-[#e5d8c8] bg-[#fffaf3] p-2 shadow-sm lg:hidden ${open ? "flex" : "hidden"}`}>
                    <div className="flex flex-col gap-1">
                        {visibleItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                                        active
                                            ? "bg-[#8b6b4f] text-white shadow-sm"
                                            : "text-[#5a4738] hover:bg-[#efe4d6] hover:text-[#2f241f]"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-2 border-t border-[#e5d8c8] pt-3">
                        {user ? (
                            <>
                                <Link
                                    href="/profile"
                                    onClick={() => setOpen(false)}
                                    className="rounded-md bg-[#efe4d6] px-3 py-2 text-sm font-semibold text-[#5a4738]"
                                >
                                    User profile
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-md border border-[#d9c7b3] bg-[#fffaf3] px-3 py-2 text-sm font-semibold text-[#5a4738] transition hover:bg-[#efe4d6]"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link href="/login" onClick={() => setOpen(false)} className="rounded-md bg-[#8b6b4f] px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#775a43]">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
