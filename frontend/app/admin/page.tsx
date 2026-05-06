"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import {
    fetchAgencies,
    fetchAgents,
    fetchProperties,
    fetchUsers,
    type Agency,
    type Agent,
    type Property,
    type User,
} from "@/lib/api";

export default function AdminPage() {
    const router = useRouter();
    const { user, ready, isAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (ready && (!user || !isAdmin)) {
            router.push("/login");
        }
    }, [ready, user, isAdmin, router]);

    useEffect(() => {
        async function loadAdminData() {
            setError("");
            try {
                const [userData, agentData, agencyData, propertyData] = await Promise.all([
                    fetchUsers(),
                    fetchAgents(),
                    fetchAgencies(),
                    fetchProperties(),
                ]);
                setUsers(userData);
                setAgents(agentData);
                setAgencies(agencyData);
                setProperties(propertyData);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Could not load admin data.");
            }
        }

        if (isAdmin) {
            loadAdminData();
        }
    }, [isAdmin]);

    if (!ready || !user) {
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
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-lg border border-stone-200 bg-white p-5">
                                <p className="text-sm font-bold uppercase tracking-wide text-stone-500">
                                    {label}
                                </p>
                                <p className="mt-2 text-3xl font-black text-stone-950">{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 overflow-hidden rounded-lg border border-stone-200 bg-white">
                        <div className="border-b border-stone-200 p-5">
                            <h2 className="text-2xl font-black text-stone-950">Users</h2>
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
                                    {users.map((item) => (
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
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
