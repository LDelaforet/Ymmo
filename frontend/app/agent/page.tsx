"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PropertyCard, { formatPrice } from "@/components/PropertyCard";
import { useAuth } from "@/components/AuthProvider";
import { fetchAgents, fetchAgencies, fetchProperties, type Agent, type Agency, type Property } from "@/lib/api";

export default function AgentOfficePage() {
    const router = useRouter();
    const { user, ready, isAgent } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [status, setStatus] = useState("all");

    useEffect(() => {
        if (ready && (!user || !isAgent)) {
            router.push("/login");
        }
    }, [ready, user, isAgent, router]);

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

    const currentAgent = agents.find((agent) => agent.user?.email === user?.email);
    const visibleProperties = currentAgent
        ? properties.filter((property) => property.agent_id === currentAgent.agent_id)
        : properties;
    const filteredProperties = visibleProperties.filter(
        (property) => status === "all" || property.status === status,
    );
    const statuses = useMemo(
        () => ["all", ...Array.from(new Set(visibleProperties.map((property) => property.status || "available")))],
        [visibleProperties],
    );
    const totalValue = visibleProperties.reduce((sum, property) => {
        const price = typeof property.price === "string" ? Number.parseFloat(property.price) : property.price;
        return sum + (Number.isNaN(price) ? 0 : price);
    }, 0);
    const availableCount = visibleProperties.filter((property) => property.status !== "sold").length;

    const findAgent = (property: Property) =>
        agents.find((agent) => agent.agent_id === property.agent_id);
    const findAgency = (property: Property) =>
        agencies.find((agency) => agency.agency_id === property.agency_id);

    if (!ready || !user) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-stone-50 p-8 text-center text-stone-600">
                    Loading agent office...
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
                            Agent office
                        </p>
                        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                            <div>
                                <h1 className="text-4xl font-black text-stone-950">
                                    Inventory dashboard
                                </h1>
                                <p className="mt-3 max-w-2xl text-stone-600">
                                    Review your assigned listings and jump back to the client side whenever you need to experience the public search flow.
                                </p>
                            </div>
                            <Link
                                href="/dashboard"
                                className="rounded-md border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-900 transition hover:bg-stone-100"
                            >
                                View client side
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <p className="text-sm font-bold uppercase tracking-wide text-stone-500">
                                Agent
                            </p>
                            <p className="mt-2 text-xl font-black text-stone-950">
                                {user.first_name} {user.last_name}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                                {currentAgent?.specialty || "All specialties"}
                            </p>
                        </div>
                        <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <p className="text-sm font-bold uppercase tracking-wide text-stone-500">
                                Listings
                            </p>
                            <p className="mt-2 text-3xl font-black text-stone-950">{visibleProperties.length}</p>
                        </div>
                        <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <p className="text-sm font-bold uppercase tracking-wide text-stone-500">
                                Available
                            </p>
                            <p className="mt-2 text-3xl font-black text-stone-950">{availableCount}</p>
                        </div>
                        <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <p className="text-sm font-bold uppercase tracking-wide text-stone-500">
                                Portfolio value
                            </p>
                            <p className="mt-2 text-3xl font-black text-stone-950">{formatPrice(totalValue)}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col justify-between gap-4 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-2xl font-black text-stone-950">Managed properties</h2>
                            <p className="mt-1 text-sm text-stone-600">
                                {currentAgent
                                    ? "Showing listings assigned to your agent profile."
                                    : "No linked agent profile found, so all listings are visible."}
                            </p>
                        </div>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="min-h-11 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 outline-none transition focus:border-emerald-700"
                        >
                            {statuses.map((item) => (
                                <option key={item} value={item}>
                                    {item === "all" ? "All statuses" : item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredProperties.map((property) => (
                            <PropertyCard
                                key={property.property_id}
                                property={property}
                                agent={findAgent(property)}
                                agency={findAgency(property)}
                                showAgentTools
                            />
                        ))}
                    </div>

                    {filteredProperties.length === 0 ? (
                        <p className="mt-6 rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
                            No listings match this status.
                        </p>
                    ) : null}
                </section>
            </main>
        </>
    );
}
