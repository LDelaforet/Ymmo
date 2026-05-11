"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/components/AuthProvider";
import {
    createProperty,
    fetchAgents,
    fetchAgencies,
    fetchProperties,
    fetchTransactions,
    fetchVisitRequests,
    uploadPropertyImages,
    updateTransaction,
    updateProperty,
    updateVisitRequest,
    type Agent,
    type Agency,
    type Property,
    type Transaction,
    type VisitRequest,
} from "@/lib/api";

export default function AgentOfficePage() {
    const router = useRouter();
    const { user, ready, isAgent } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [status, setStatus] = useState("all");
    const [visits, setVisits] = useState<VisitRequest[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedLeadProperty, setSelectedLeadProperty] = useState<Property | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [newProperty, setNewProperty] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        bedrooms: "2",
        surface: "60",
        property_type: "apartment",
    });
    const [newPropertyImages, setNewPropertyImages] = useState<File[]>([]);

    useEffect(() => {
        if (ready && (!user || !isAgent)) {
            router.push("/login");
        }
    }, [ready, user, isAgent, router]);

    useEffect(() => {
        async function loadData() {
            setError("");
            try {
                const [propertyData, agentData, agencyData, visitData, transactionData] = await Promise.all([
                    fetchProperties(),
                    fetchAgents(),
                    fetchAgencies(),
                    fetchVisitRequests(),
                    fetchTransactions(),
                ]);
                setProperties(propertyData);
                setAgents(agentData);
                setAgencies(agencyData);
                setVisits(visitData);
                setTransactions(transactionData);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Could not load the agent office.");
            }
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
    const availableCount = visibleProperties.filter((property) => property.status !== "sold").length;

    const findAgent = (property: Property) =>
        agents.find((agent) => agent.agent_id === property.agent_id);
    const findAgency = (property: Property) =>
        agencies.find((agency) => agency.agency_id === property.agency_id);
    const visiblePropertyIds = new Set(visibleProperties.map((property) => property.property_id));
    const visibleVisits = visits.filter((visit) => visiblePropertyIds.has(visit.property_id));
    const selectedVisits = selectedLeadProperty
        ? visits.filter((visit) => visit.property_id === selectedLeadProperty.property_id)
        : [];
    const visibleTransactions = currentAgent
        ? transactions.filter(
            (transaction) =>
                transaction.agent_id === currentAgent.agent_id || transaction.agency_id === currentAgent.agency_id,
        )
        : transactions;

    async function handleCreateProperty(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setNotice("");

        const agent = currentAgent || agents[0];
        const agency = agent
            ? agencies.find((item) => item.agency_id === agent.agency_id) || agencies[0]
            : agencies[0];

        if (!agent || !agency) {
            setError("Create an agent and agency before adding a property.");
            return;
        }

        try {
            const created = await createProperty({
                title: newProperty.title,
                description: newProperty.description,
                price: Number(newProperty.price),
                location: newProperty.location,
                status: "available",
                bedrooms: Number(newProperty.bedrooms),
                surface: Number(newProperty.surface),
                property_type: newProperty.property_type,
                photo_url: "",
                agency_id: agency.agency_id,
                agent_id: agent.agent_id,
            });

            let publishedProperty = created;
            if (newPropertyImages.length > 0) {
                const uploaded = await uploadPropertyImages(created.property_id, newPropertyImages);
                publishedProperty = { ...created, photo_url: uploaded.photo_url };
            }

            setProperties((current) => [created, ...current]);
            setNewProperty({
                title: "",
                description: "",
                price: "",
                location: "",
                bedrooms: "2",
                surface: "60",
                property_type: "apartment",
            });
            setNewPropertyImages([]);
            setProperties((current) =>
                current.map((property) =>
                    property.property_id === created.property_id ? publishedProperty : property,
                ),
            );
            setNotice("Property created and published.");
        } catch (createError) {
            setError(createError instanceof Error ? createError.message : "Could not create the property.");
        }
    }

    async function handleStatusChange(propertyId: number, nextStatus: string) {
        setError("");
        try {
            const updated = await updateProperty(propertyId, { status: nextStatus });
            setProperties((current) =>
                current.map((property) =>
                    property.property_id === propertyId ? updated : property,
                ),
            );
            setNotice("Property status updated.");
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : "Could not update the status.");
        }
    }

    async function handleVisitStatus(visitId: number, nextStatus: string) {
        setError("");
        try {
            const updated = await updateVisitRequest(visitId, nextStatus);
            setVisits((current) =>
                current.map((visit) => (visit.visit_id === visitId ? updated : visit)),
            );
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : "Could not update this lead.");
        }
    }

    async function handleTransactionStatus(transactionId: number, status: string) {
        setError("");
        try {
            const updated = await updateTransaction(transactionId, { status });
            setTransactions((current) =>
                current.map((transaction) =>
                    transaction.transaction_id === transactionId ? updated : transaction,
                ),
            );
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : "Could not update this transaction.");
        }
    }

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
                    {error ? (
                        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                            {error}
                        </p>
                    ) : null}
                    {notice ? (
                        <p className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                            {notice}
                        </p>
                    ) : null}

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
                                Open leads
                            </p>
                            <p className="mt-2 text-3xl font-black text-stone-950">
                                {visibleVisits.filter((visit) => visit.status !== "closed").length}
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleCreateProperty}
                        className="mt-8 grid gap-4 rounded-lg border border-stone-200 bg-white p-5 lg:grid-cols-4"
                    >
                        <div className="lg:col-span-4">
                            <h2 className="text-2xl font-black text-stone-950">Create a property</h2>
                            <p className="mt-1 text-sm text-stone-600">
                                Add concrete details and upload one or multiple photos so buyers can compare listings.
                            </p>
                        </div>
                        <input
                            value={newProperty.title}
                            onChange={(event) => setNewProperty((current) => ({ ...current, title: event.target.value }))}
                            placeholder="Title"
                            className="min-h-11 rounded-md border border-stone-300 px-3 text-sm text-stone-950"
                            required
                        />
                        <input
                            value={newProperty.location}
                            onChange={(event) => setNewProperty((current) => ({ ...current, location: event.target.value }))}
                            placeholder="Location"
                            className="min-h-11 rounded-md border border-stone-300 px-3 text-sm text-stone-950"
                            required
                        />
                        <input
                            type="number"
                            value={newProperty.price}
                            onChange={(event) => setNewProperty((current) => ({ ...current, price: event.target.value }))}
                            placeholder="Price"
                            className="min-h-11 rounded-md border border-stone-300 px-3 text-sm text-stone-950"
                            required
                        />
                        <select
                            value={newProperty.property_type}
                            onChange={(event) => setNewProperty((current) => ({ ...current, property_type: event.target.value }))}
                            className="min-h-11 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800"
                        >
                            <option value="apartment">Apartment</option>
                            <option value="house">House</option>
                            <option value="studio">Studio</option>
                            <option value="loft">Loft</option>
                        </select>
                        <input
                            type="number"
                            value={newProperty.bedrooms}
                            onChange={(event) => setNewProperty((current) => ({ ...current, bedrooms: event.target.value }))}
                            placeholder="Rooms"
                            className="min-h-11 rounded-md border border-stone-300 px-3 text-sm text-stone-950"
                            required
                        />
                        <input
                            type="number"
                            value={newProperty.surface}
                            onChange={(event) => setNewProperty((current) => ({ ...current, surface: event.target.value }))}
                            placeholder="Surface m2"
                            className="min-h-11 rounded-md border border-stone-300 px-3 text-sm text-stone-950"
                            required
                        />
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(event) => {
                                const files = Array.from(event.target.files || []);
                                setNewPropertyImages(files);
                            }}
                            className="min-h-11 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 lg:col-span-2"
                        />
                        <textarea
                            value={newProperty.description}
                            onChange={(event) => setNewProperty((current) => ({ ...current, description: event.target.value }))}
                            placeholder="Description"
                            className="min-h-24 rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-950 lg:col-span-3"
                            required
                        />
                        <button
                            type="submit"
                            className="min-h-11 rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                        >
                            Publish property
                        </button>
                    </form>

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
                                leadCount={visits.filter((visit) => visit.property_id === property.property_id).length}
                                onReviewLeads={setSelectedLeadProperty}
                                onStatusChange={handleStatusChange}
                                showAgentTools
                            />
                        ))}
                    </div>

                    {filteredProperties.length === 0 ? (
                        <p className="mt-6 rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
                            No listings match this status.
                        </p>
                    ) : null}

                    {selectedLeadProperty ? (
                        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/60 p-4">
                            <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-stone-950">
                                            Leads for {selectedLeadProperty.title}
                                        </h2>
                                        <p className="mt-1 text-sm text-stone-600">
                                            Review visit requests and update their status.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedLeadProperty(null)}
                                        className="rounded-md border border-stone-300 px-3 py-2 text-sm font-bold text-stone-800"
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="mt-5 space-y-3">
                                    {selectedVisits.length === 0 ? (
                                        <p className="rounded-md bg-stone-50 p-4 text-sm text-stone-600">
                                            No visit requests for this property yet.
                                        </p>
                                    ) : (
                                        selectedVisits.map((visit) => (
                                            <div key={visit.visit_id} className="rounded-md border border-stone-200 p-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <p className="font-black text-stone-950">{visit.name}</p>
                                                        <p className="text-sm text-stone-600">{visit.email}</p>
                                                        <p className="mt-2 text-sm leading-6 text-stone-700">
                                                            {visit.message || "No message provided."}
                                                        </p>
                                                    </div>
                                                    <select
                                                        value={visit.status}
                                                        onChange={(event) => handleVisitStatus(visit.visit_id, event.target.value)}
                                                        className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800"
                                                    >
                                                        <option value="new">New</option>
                                                        <option value="contacted">Contacted</option>
                                                        <option value="scheduled">Scheduled</option>
                                                        <option value="closed">Closed</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="mt-10 overflow-hidden rounded-lg border border-stone-200 bg-white">
                        <div className="border-b border-stone-200 p-5">
                            <h2 className="text-2xl font-black text-stone-950">Client transactions</h2>
                            <p className="mt-1 text-sm text-stone-600">
                                Update the progress of purchase and sale projects assigned to your agency.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-160 text-left text-sm">
                                <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
                                    <tr>
                                        <th className="px-5 py-3">ID</th>
                                        <th className="px-5 py-3">Type</th>
                                        <th className="px-5 py-3">Budget</th>
                                        <th className="px-5 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {visibleTransactions.map((transaction) => (
                                        <tr key={transaction.transaction_id}>
                                            <td className="px-5 py-3 font-semibold text-stone-900">
                                                #{transaction.transaction_id}
                                            </td>
                                            <td className="px-5 py-3 capitalize text-stone-700">
                                                {transaction.transaction_type}
                                            </td>
                                            <td className="px-5 py-3 text-stone-700">
                                                {transaction.budget ? `${transaction.budget}` : "-"}
                                            </td>
                                            <td className="px-5 py-3">
                                                <select
                                                    value={transaction.status}
                                                    onChange={(event) =>
                                                        handleTransactionStatus(
                                                            transaction.transaction_id,
                                                            event.target.value,
                                                        )
                                                    }
                                                    className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800"
                                                >
                                                    <option value="new">New</option>
                                                    <option value="in_review">In review</option>
                                                    <option value="offer">Offer</option>
                                                    <option value="signed">Signed</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {visibleTransactions.length === 0 ? (
                                <p className="p-4 text-sm text-stone-500">
                                    No transactions assigned to this agency yet.
                                </p>
                            ) : null}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
