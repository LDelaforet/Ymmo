"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/components/AuthProvider";
import { fetchAgents, fetchAgencies, fetchProperties, type Agent, type Agency, type Property } from "@/lib/api";

export default function ClientDashboardPage() {
    const router = useRouter();
    const { user, ready, isClient, isAgent } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [savedIds, setSavedIds] = useState<number[]>([]);

    useEffect(() => {
        if (ready && (!user || !isClient)) {
            router.push("/login");
        }
    }, [ready, user, isClient, router]);

    useEffect(() => {
        async function loadData() {
            const [propertyData, agentData, agencyData] = await Promise.all([
                fetchProperties(),
                fetchAgents(),
                fetchAgencies(),
            ]);
            setProperties(propertyData);
            setAgents(agentData);
            setAgencies(agencyData);
        }

        loadData();
    }, []);

    useEffect(() => {
        if (!user) return;
        queueMicrotask(() => {
            const storedIds = window.localStorage.getItem(`ymmo.saved.${user.id}`);
            setSavedIds(storedIds ? JSON.parse(storedIds) : []);
        });
    }, [user]);

    function toggleSaved(propertyId: number) {
        if (!user) return;
        const nextIds = savedIds.includes(propertyId)
            ? savedIds.filter((id) => id !== propertyId)
            : [...savedIds, propertyId];
        setSavedIds(nextIds);
        window.localStorage.setItem(`ymmo.saved.${user.id}`, JSON.stringify(nextIds));
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
                        <section>
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <h2 className="text-2xl font-black text-stone-950">Recommended for you</h2>
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
                    </div>
                </section>
            </main>
        </>
    );
}
