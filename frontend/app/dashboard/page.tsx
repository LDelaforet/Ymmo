"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/components/AuthProvider";
import {
    createTransaction,
    fetchAgents,
    fetchAgencies,
    fetchProperties,
    fetchSavedPropertyIds,
    fetchUserTransactions,
    removeSavedPropertyForUser,
    savePropertyForUser,
    type Agent,
    type Agency,
    type Property,
    type Transaction,
} from "@/lib/api";

export default function ClientDashboardPage() {
    const router = useRouter();
    const { user, ready, isClient, isAgent } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [savedIds, setSavedIds] = useState<number[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [requestType, setRequestType] = useState("purchase");
    const [requestPropertyId, setRequestPropertyId] = useState("");
    const [requestBudget, setRequestBudget] = useState("");
    const [requestNotes, setRequestNotes] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (ready && (!user || !isClient)) {
            router.push("/login");
        }
    }, [ready, user, isClient, router]);

    useEffect(() => {
        async function loadData() {
            setError("");
            try {
                const [propertyData, agentData, agencyData] = await Promise.all([
                    fetchProperties(),
                    fetchAgents(),
                    fetchAgencies(),
                ]);
                setProperties(propertyData);
                setAgents(agentData);
                setAgencies(agencyData);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Could not load your dashboard.");
            }
        }

        loadData();
    }, []);

    useEffect(() => {
        if (!user) return;
        fetchSavedPropertyIds(user.id)
            .then(setSavedIds)
            .catch((loadError) => {
                setError(loadError instanceof Error ? loadError.message : "Could not load saved properties.");
            });
    }, [user]);

    useEffect(() => {
        if (!user) return;
        fetchUserTransactions(user.id)
            .then(setTransactions)
            .catch((loadError) => {
                setError(loadError instanceof Error ? loadError.message : "Could not load your transactions.");
            });
    }, [user]);

    async function toggleSaved(propertyId: number) {
        if (!user) return;
        const isSaved = savedIds.includes(propertyId);
        const nextIds = isSaved
            ? savedIds.filter((id) => id !== propertyId)
            : [...savedIds, propertyId];
        setSavedIds(nextIds);
        try {
            if (isSaved) {
                await removeSavedPropertyForUser(user.id, propertyId);
            } else {
                await savePropertyForUser(user.id, propertyId);
            }
        } catch (saveError) {
            setSavedIds(savedIds);
            setError(saveError instanceof Error ? saveError.message : "Could not update saved properties.");
        }
    }

    async function handleCreateTransaction() {
        if (!user) return;
        setError("");
        try {
            const created = await createTransaction({
                client_id: user.id,
                transaction_type: requestType,
                property_id: requestPropertyId ? Number(requestPropertyId) : undefined,
                budget: requestBudget ? Number(requestBudget) : undefined,
                notes: requestNotes,
                status: "new",
            });
            setTransactions((current) => [created, ...current]);
            setRequestPropertyId("");
            setRequestBudget("");
            setRequestNotes("");
        } catch (createError) {
            setError(createError instanceof Error ? createError.message : "Could not create your request.");
        }
    }

    const recommendedProperties = useMemo(
        () => properties.filter((property) => property.status !== "sold").slice(0, 3),
        [properties],
    );
    const savedProperties = properties.filter((property) => savedIds.includes(property.property_id));
    const findAgent = (property: Property) =>
        agents.find((agent) => agent.agent_id === property.agent_id);
    const findAgency = (property: Property) =>
        agencies.find((agency) => agency.agency_id === property.agency_id);

    if (!ready || !user) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-stone-50 p-8 text-center text-stone-600">
                    Loading your dashboard...
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
                            Client area
                        </p>
                        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                            <div>
                                <h1 className="text-4xl font-black text-stone-950">
                                    Welcome back, {user.first_name}
                                </h1>
                                <p className="mt-3 max-w-2xl text-stone-600">
                                    Track properties you like and keep browsing the inventory from the client side.
                                </p>
                            </div>
                            {isAgent ? (
                                <Link
                                    href="/agent"
                                    className="rounded-md bg-stone-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
                                >
                                    Open agent office
                                </Link>
                            ) : null}
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
                    <aside className="space-y-4">
                        <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <p className="text-sm font-bold uppercase tracking-wide text-stone-500">
                                Profile
                            </p>
                            <p className="mt-3 text-xl font-black text-stone-950">
                                {user.first_name} {user.last_name}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">{user.email}</p>
                            <p className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold capitalize text-emerald-800">
                                {user.role}
                            </p>
                        </div>
                        <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <p className="text-sm font-bold uppercase tracking-wide text-stone-500">
                                Search stats
                            </p>
                            <div className="mt-4 grid gap-3">
                                <div className="rounded-md bg-stone-50 p-3">
                                    <p className="text-2xl font-black text-stone-950">{savedIds.length}</p>
                                    <p className="text-sm text-stone-500">Saved properties</p>
                                </div>
                                <div className="rounded-md bg-stone-50 p-3">
                                    <p className="text-2xl font-black text-stone-950">
                                        {recommendedProperties.length}
                                    </p>
                                    <p className="text-sm text-stone-500">Recommended visits</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="space-y-10">
                        {error ? (
                            <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                                {error}
                            </p>
                        ) : null}
                        <section>
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <h2 className="text-2xl font-black text-stone-950">Available now</h2>
                                <Link href="/properties" className="text-sm font-bold text-emerald-700">
                                    Browse all
                                </Link>
                            </div>
                            <div className="grid gap-6 xl:grid-cols-3">
                                {recommendedProperties.map((property) => (
                                    <div key={property.property_id} className="space-y-3">
                                        <PropertyCard
                                            property={property}
                                            agent={findAgent(property)}
                                            agency={findAgency(property)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleSaved(property.property_id)}
                                            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-bold text-stone-800 transition hover:bg-stone-100"
                                        >
                                            {savedIds.includes(property.property_id) ? "Remove from saved" : "Save property"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="mb-4 text-2xl font-black text-stone-950">Saved properties</h2>
                            {savedProperties.length === 0 ? (
                                <p className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
                                    No saved properties yet.
                                </p>
                            ) : (
                                <div className="grid gap-6 xl:grid-cols-3">
                                    {savedProperties.map((property) => (
                                        <PropertyCard
                                            key={property.property_id}
                                            property={property}
                                            agent={findAgent(property)}
                                            agency={findAgency(property)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                        <section>
                            <h2 className="mb-4 text-2xl font-black text-stone-950">Purchase or sale requests</h2>
                            <div className="rounded-lg border border-stone-200 bg-white p-5">
                                <p className="text-sm text-stone-600">
                                    Create a request and follow each step of your transaction in real time.
                                </p>
                                <div className="mt-4 grid gap-3 lg:grid-cols-4">
                                    <select
                                        value={requestType}
                                        onChange={(event) => setRequestType(event.target.value)}
                                        className="min-h-11 rounded-md border border-stone-300 px-3 text-sm"
                                    >
                                        <option value="purchase">Purchase</option>
                                        <option value="sale">Sale</option>
                                    </select>
                                    <select
                                        value={requestPropertyId}
                                        onChange={(event) => setRequestPropertyId(event.target.value)}
                                        className="min-h-11 rounded-md border border-stone-300 px-3 text-sm"
                                    >
                                        <option value="">No property selected</option>
                                        {properties.map((property) => (
                                            <option key={property.property_id} value={property.property_id}>
                                                {property.title}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={requestBudget}
                                        onChange={(event) => setRequestBudget(event.target.value)}
                                        placeholder="Budget"
                                        className="min-h-11 rounded-md border border-stone-300 px-3 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreateTransaction}
                                        className="min-h-11 rounded-md bg-emerald-700 px-4 text-sm font-bold text-white"
                                    >
                                        Submit request
                                    </button>
                                </div>
                                <textarea
                                    value={requestNotes}
                                    onChange={(event) => setRequestNotes(event.target.value)}
                                    placeholder="Tell the agency about your project"
                                    className="mt-3 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
                                <table className="w-full min-w-160 text-left text-sm">
                                    <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
                                        <tr>
                                            <th className="px-5 py-3">Type</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3">Budget</th>
                                            <th className="px-5 py-3">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {transactions.map((item) => (
                                            <tr key={item.transaction_id}>
                                                <td className="px-5 py-3 font-semibold capitalize text-stone-900">
                                                    {item.transaction_type}
                                                </td>
                                                <td className="px-5 py-3 font-bold capitalize text-stone-800">
                                                    {item.status.replaceAll("_", " ")}
                                                </td>
                                                <td className="px-5 py-3 text-stone-600">
                                                    {item.budget ? `${item.budget}` : "-"}
                                                </td>
                                                <td className="px-5 py-3 text-stone-600">{item.notes || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {transactions.length === 0 ? (
                                    <p className="p-4 text-sm text-stone-500">No transaction requests yet.</p>
                                ) : null}
                            </div>
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}
