"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import PropertyCard, { formatPrice } from "@/components/PropertyCard";
import { fetchAgents, fetchAgencies, fetchProperties, type Agent, type Agency, type Property } from "@/lib/api";

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [maxPrice, setMaxPrice] = useState("all");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [error, setError] = useState("");
    const pageSize = 6;

    useEffect(() => {
        async function loadProperties() {
            setLoading(true);
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
                setError(loadError instanceof Error ? loadError.message : "Could not load properties.");
            } finally {
                setLoading(false);
            }
        }

        loadProperties();
    }, []);

    const statuses = useMemo(
        () => ["all", ...Array.from(new Set(properties.map((property) => property.status || "available")))],
        [properties],
    );

    const filteredProperties = useMemo(() => {
        const matches = properties.filter((property) => {
            const price = typeof property.price === "string" ? Number.parseFloat(property.price) : property.price;
            const matchesQuery = `${property.title} ${property.description} ${property.location}`
                .toLowerCase()
                .includes(query.toLowerCase());
            const matchesStatus = status === "all" || property.status === status;
            const matchesPrice = maxPrice === "all" || price <= Number(maxPrice);

            return matchesQuery && matchesStatus && matchesPrice;
        });

        return [...matches].sort((left, right) => {
            const leftPrice = typeof left.price === "string" ? Number.parseFloat(left.price) : left.price;
            const rightPrice = typeof right.price === "string" ? Number.parseFloat(right.price) : right.price;

            if (sort === "price-asc") return leftPrice - rightPrice;
            if (sort === "price-desc") return rightPrice - leftPrice;
            return right.property_id - left.property_id;
        });
    }, [properties, query, status, maxPrice, sort]);

    const findAgent = (property: Property) =>
        agents.find((agent) => agent.agent_id === property.agent_id);
    const findAgency = (property: Property) =>
        agencies.find((agency) => agency.agency_id === property.agency_id);

    const lowestPrice = filteredProperties.reduce<number | null>((lowest, property) => {
        const price = typeof property.price === "string" ? Number.parseFloat(property.price) : property.price;
        if (lowest === null) return price;
        return price < lowest ? price : lowest;
    }, null);
    const pageCount = Math.max(1, Math.ceil(filteredProperties.length / pageSize));
    const paginatedProperties = filteredProperties.slice((page - 1) * pageSize, page * pageSize);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50">
                <section className="border-b border-stone-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                            Property search
                        </p>
                        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                            <div>
                                <h1 className="text-4xl font-black text-stone-950">Browse properties</h1>
                                <p className="mt-3 max-w-2xl text-stone-600">
                                    Search the Ymmo inventory by location, status, price, or listing details.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                                <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                                    <p className="font-black text-stone-950">{filteredProperties.length}</p>
                                    <p className="text-stone-500">Matches</p>
                                </div>
                                <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                                    <p className="font-black text-stone-950">{properties.length}</p>
                                    <p className="text-stone-500">Total</p>
                                </div>
                                <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
                                    <p className="font-black text-stone-950">
                                        {lowestPrice === null ? "-" : formatPrice(lowestPrice)}
                                    </p>
                                    <p className="text-stone-500">Lowest</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 md:grid-cols-[1fr_180px_180px_180px]">
                            <input
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search by city, title, or feature"
                                className="min-h-11 rounded-md border border-stone-300 bg-white px-4 text-sm text-stone-950 outline-none transition focus:border-emerald-700"
                            />
                            <select
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    setPage(1);
                                }}
                                className="min-h-11 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 outline-none transition focus:border-emerald-700"
                            >
                                {statuses.map((item) => (
                                    <option key={item} value={item}>
                                        {item === "all" ? "All statuses" : item}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={maxPrice}
                                onChange={(event) => {
                                    setMaxPrice(event.target.value);
                                    setPage(1);
                                }}
                                className="min-h-11 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 outline-none transition focus:border-emerald-700"
                            >
                                <option value="all">Any price</option>
                                <option value="250000">Under $250k</option>
                                <option value="500000">Under $500k</option>
                                <option value="750000">Under $750k</option>
                                <option value="1000000">Under $1M</option>
                            </select>
                            <select
                                value={sort}
                                onChange={(event) => {
                                    setSort(event.target.value);
                                    setPage(1);
                                }}
                                className="min-h-11 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 outline-none transition focus:border-emerald-700"
                            >
                                <option value="newest">Newest first</option>
                                <option value="price-asc">Price: low to high</option>
                                <option value="price-desc">Price: high to low</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                    {error ? (
                        <p className="rounded-lg border border-red-200 bg-red-50 p-8 text-center font-semibold text-red-700">
                            {error}
                        </p>
                    ) : loading ? (
                        <p className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
                            Loading properties...
                        </p>
                    ) : filteredProperties.length === 0 ? (
                        <p className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
                            No properties match your search.
                        </p>
                    ) : (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {paginatedProperties.map((property) => (
                                    <PropertyCard
                                        key={property.property_id}
                                        property={property}
                                        agent={findAgent(property)}
                                        agency={findAgency(property)}
                                    />
                                ))}
                            </div>
                            <div className="mt-8 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={page === 1}
                                    className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-bold text-stone-600">
                                    Page {page} of {pageCount}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                                    disabled={page === pageCount}
                                    className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </>
    );
}
