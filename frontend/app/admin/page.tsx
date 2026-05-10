"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import {
    fetchAgencies,
    fetchAgents,
    fetchMarketOverview,
    fetchProperties,
    fetchTransactions,
    fetchUsers,
    type Agency,
    type Agent,
    type MarketOverview,
    type Property,
    type Transaction,
    type User,
} from "@/lib/api";

export default function AdminPage() {
    const router = useRouter();
    const { user, ready, isAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [overview, setOverview] = useState<MarketOverview | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState<"all" | User["role"]>("all");
    const [userPage, setUserPage] = useState(1);
    const userPageSize = 8;

    useEffect(() => {
        if (ready && (!user || !isAdmin)) {
            router.push("/login");
        }
    }, [ready, user, isAdmin, router]);

    useEffect(() => {
        async function loadAdminData() {
            setError("");
            setLoading(true);
            try {
                const [userData, agentData, agencyData, propertyData, transactionData, overviewData] = await Promise.all([
                    fetchUsers(),
                    fetchAgents(),
                    fetchAgencies(),
                    fetchProperties(),
                    fetchTransactions(),
                    fetchMarketOverview(),
                ]);
                setUsers(userData);
                setAgents(agentData);
                setAgencies(agencyData);
                setProperties(propertyData);
                setTransactions(transactionData);
                setOverview(overviewData);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Could not load admin data.");
            } finally {
                setLoading(false);
            }
        }

        if (isAdmin) {
            loadAdminData();
        }
    }, [isAdmin]);

    const filteredUsers = useMemo(() => {
        const query = userSearch.trim().toLowerCase();
        return users.filter((item) => {
            const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
            const searchMatches =
                !query || fullName.includes(query) || item.email.toLowerCase().includes(query);
            const roleMatches = userRoleFilter === "all" || item.role === userRoleFilter;
            return searchMatches && roleMatches;
        });
    }, [users, userSearch, userRoleFilter]);

    const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize));
    const safeUserPage = Math.min(userPage, totalUserPages);
    const paginatedUsers = useMemo(() => {
        const start = (safeUserPage - 1) * userPageSize;
        return filteredUsers.slice(start, start + userPageSize);
    }, [filteredUsers, safeUserPage, userPageSize]);

    if (!ready || !user || loading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-stone-50 p-8 text-center text-stone-600">
                    Loading admin...
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50">
                <section className="border-b border-stone-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                            Admin
                        </p>
                        <h1 className="mt-2 text-4xl font-black text-stone-950">
                            Platform overview
                        </h1>
                        <p className="mt-3 max-w-2xl text-stone-600">
                            Admin users now have a dedicated route instead of being treated like regular agents.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                    {error ? (
                        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                            {error}
                        </p>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-4">
                        {[
                            ["Users", users.length],
                            ["Agents", agents.length],
                            ["Agencies", agencies.length],
                            ["Properties", properties.length],
                            ["Transactions", transactions.length],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border border-stone-200 bg-white p-5">
                                <p className="text-sm font-bold uppercase tracking-wide text-stone-500">
                                    {label}
                                </p>
                                <p className="mt-2 text-3xl font-black text-stone-950">{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <p className="text-sm font-bold uppercase tracking-wide text-stone-500">Market signal</p>
                            <p className="mt-2 text-2xl font-black capitalize text-stone-950">
                                {overview?.market_signal || "n/a"}
                            </p>
                        </div>
                        <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <p className="text-sm font-bold uppercase tracking-wide text-stone-500">Avg price</p>
                            <p className="mt-2 text-2xl font-black text-stone-950">
                                {overview ? Math.round(overview.avg_price).toLocaleString() : "-"}
                            </p>
                        </div>
                        <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <p className="text-sm font-bold uppercase tracking-wide text-stone-500">Completion ratio</p>
                            <p className="mt-2 text-2xl font-black text-stone-950">
                                {overview ? `${Math.round(overview.transaction_completion_ratio * 100)}%` : "-"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-lg border border-stone-200 bg-white">
                        <div className="border-b border-stone-200 p-5">
                            <h2 className="text-2xl font-black text-stone-950">Users</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]">
                                <input
                                    type="search"
                                    value={userSearch}
                                    onChange={(event) => {
                                        setUserSearch(event.target.value);
                                        setUserPage(1);
                                    }}
                                    placeholder="Search by name or email"
                                    className="min-h-11 rounded-md border border-stone-300 px-3 text-sm text-stone-950 outline-none focus:border-emerald-700"
                                />
                                <select
                                    value={userRoleFilter}
                                    onChange={(event) => {
                                        setUserRoleFilter(event.target.value as "all" | User["role"]);
                                        setUserPage(1);
                                    }}
                                    className="min-h-11 rounded-md border border-stone-300 px-3 text-sm text-stone-950 outline-none focus:border-emerald-700"
                                >
                                    <option value="all">All roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="agent">Agent</option>
                                    <option value="client">Client</option>
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-160 text-left text-sm">
                                <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
                                    <tr>
                                        <th className="px-5 py-3">Name</th>
                                        <th className="px-5 py-3">Email</th>
                                        <th className="px-5 py-3">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {paginatedUsers.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-5 py-3 font-semibold text-stone-950">
                                                {item.first_name} {item.last_name}
                                            </td>
                                            <td className="px-5 py-3 text-stone-600">{item.email}</td>
                                            <td className="px-5 py-3 font-bold capitalize text-stone-800">
                                                {item.role}
                                            </td>
                                        </tr>
                                    ))}
                                    {!paginatedUsers.length ? (
                                        <tr>
                                            <td className="px-5 py-8 text-center text-stone-500" colSpan={3}>
                                                No user matches your filters.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4">
                            <p className="text-sm text-stone-600">
                                {filteredUsers.length} result{filteredUsers.length > 1 ? "s" : ""}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setUserPage((value) => Math.max(1, value - 1))}
                                    disabled={safeUserPage <= 1}
                                    className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <p className="text-sm font-semibold text-stone-700">
                                    Page {safeUserPage} / {totalUserPages}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setUserPage((value) => Math.min(totalUserPages, value + 1))}
                                    disabled={safeUserPage >= totalUserPages}
                                    className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
