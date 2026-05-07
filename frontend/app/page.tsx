"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import { fetchAgents, fetchAgencies, fetchProperties, type Agent, type Agency, type Property } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { user, isAgent } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
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
        setError(loadError instanceof Error ? loadError.message : "Could not load listings.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const featuredProperties = useMemo(
    () => properties.filter((property) => property.status !== "sold").slice(0, 6),
    [properties],
  );
  const availableCount = properties.filter((property) => property.status !== "sold").length;
  const cities = new Set(properties.map((property) => property.location)).size;

  const findAgent = (property: Property) =>
    agents.find((agent) => agent.agent_id === property.agent_id);
  const findAgency = (property: Property) =>
    agencies.find((agency) => agency.agency_id === property.agency_id);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f2eb]">
        <section className="border-b border-[#e5d8c8] bg-[#fffaf3]">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-wide text-[#8b6b4f]">
                Buy, rent, and manage with Ymmo
              </p>
              <h1 className="text-4xl font-black leading-tight text-stone-950 sm:text-5xl">
                Find your next property with local agents who know the market.
              </h1>
              <p className="mt-5 text-lg leading-8 text-stone-600">
                Browse live listings, sign in as a client to track your search, or use the agent office to monitor inventory and leads.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/properties"
                  className="rounded-md bg-[#8b6b4f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#775a43]"
                >
                  Browse properties
                </Link>
                <Link
                  href={user ? (isAgent ? "/agent" : "/dashboard") : "/login"}
                  className="rounded-md border border-[#d9c7b3] bg-[#fffaf3] px-5 py-3 text-sm font-bold text-[#2f241f] transition hover:bg-[#efe4d6]"
                >
                  {user ? "Open dashboard" : "Login or register"}
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#e5d8c8] bg-[#f3e9dc] shadow-xl">
              <div className="h-72 bg-[linear-gradient(135deg,#f6ede3_0%,#e8d8c5_45%,#d5b99a_100%)] p-6 sm:h-96">
                <div className="grid h-full grid-cols-5 grid-rows-4 gap-3">
                  <div className="col-span-3 row-span-4 rounded-md bg-white/15 backdrop-blur" />
                  <div className="col-span-2 row-span-2 rounded-md bg-white/25 backdrop-blur" />
                  <div className="col-span-2 row-span-2 rounded-md bg-[#c9a889]/70" />
                </div>
              </div>
              <div className="grid grid-cols-3 border-t border-[#e5d8c8] bg-[#f9f1e7] text-[#2f241f]">
                <div className="p-4">
                  <p className="text-2xl font-black">{properties.length}</p>
                  <p className="text-xs text-[#7a6553]">Listings</p>
                </div>
                <div className="border-x border-[#e5d8c8] p-4">
                  <p className="text-2xl font-black">{availableCount}</p>
                  <p className="text-xs text-[#7a6553]">Available</p>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-black">{cities}</p>
                  <p className="text-xs text-[#7a6553]">Markets</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-stone-500">
                Featured listings
              </p>
              <h2 className="mt-1 text-3xl font-black text-stone-950">Properties ready to visit</h2>
            </div>
            <Link href="/properties" className="text-sm font-bold text-[#8b6b4f] hover:text-[#6d523d]">
              View all listings
            </Link>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-8 text-center font-semibold text-red-700">
              {error}
            </p>
          ) : loading ? (
            <p className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
              Loading properties...
            </p>
          ) : featuredProperties.length === 0 ? (
            <p className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
              No available properties yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredProperties.map((property) => (
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
      </main>
    </>
  );
}
