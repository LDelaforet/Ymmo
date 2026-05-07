"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import {
    fetchAgencies,
    fetchAgents,
    fetchProperty,
    fetchPropertyGallery,
    type Agency,
    type Agent,
    type Property,
} from "@/lib/api";
const API_BASE_URL = "http://127.0.0.1:8000";

export default function PropertyDetailsPage() {
    const params = useParams<{ id: string }>();
    const propertyId = Number(params.id);
    const [property, setProperty] = useState<Property | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [gallery, setGallery] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProperty() {
            setLoading(true);
            setError("");
            try {
                const [propertyData, agentData, agencyData, galleryData] = await Promise.all([
                    fetchProperty(propertyId),
                    fetchAgents(),
                    fetchAgencies(),
                    fetchPropertyGallery(propertyId),
                ]);
                setProperty(propertyData);
                setAgents(agentData);
                setAgencies(agencyData);
                setGallery(galleryData);
                if (galleryData.length > 0) {
                    setSelectedImage(`${API_BASE_URL}${galleryData[0]}`);
                } else if (propertyData.photo_url) {
                    setSelectedImage(`${API_BASE_URL}${propertyData.photo_url}`);
                }
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Could not load this property.");
            } finally {
                setLoading(false);
            }
        }

        if (Number.isFinite(propertyId)) {
            loadProperty();
        }
    }, [propertyId]);

    const agent = property
        ? agents.find((item) => item.agent_id === property.agent_id)
        : undefined;
    const agency = property
        ? agencies.find((item) => item.agency_id === property.agency_id)
        : undefined;

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#f7f2eb]">
                <section className="border-b border-[#e5d8c8] bg-[#fffaf3]">
                    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                        <Link href="/properties" className="text-sm font-bold text-[#8b6b4f]">
                            Back to properties
                        </Link>
                        <h1 className="mt-3 text-4xl font-black text-stone-950">
                            {property?.title || "Property details"}
                        </h1>
                        <p className="mt-3 max-w-3xl text-stone-600">
                            Compare the concrete details before requesting a visit.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                    {error ? (
                        <p className="rounded-lg border border-red-200 bg-red-50 p-8 text-center font-semibold text-red-700">
                            {error}
                        </p>
                    ) : loading ? (
                        <p className="rounded-lg border border-stone-200 bg-white p-8 text-center text-stone-600">
                            Loading property...
                        </p>
                    ) : property ? (
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                            <div className="rounded-xl border border-[#e5d8c8] bg-[#fffaf3] p-4 shadow-sm">
                                <div className="overflow-hidden rounded-lg bg-[#efe4d6]">
                                    {selectedImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={selectedImage}
                                            alt={property.title}
                                            className="h-[420px] w-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-[420px] place-items-center text-sm text-[#7a6553]">
                                            No image available
                                        </div>
                                    )}
                                </div>

                                {gallery.length > 0 ? (
                                    <div className="mt-4 grid grid-cols-5 gap-2">
                                        {gallery.map((imagePath) => {
                                            const imageUrl = `${API_BASE_URL}${imagePath}`;
                                            const active = selectedImage === imageUrl;
                                            return (
                                                <button
                                                    key={imagePath}
                                                    type="button"
                                                    onClick={() => setSelectedImage(imageUrl)}
                                                    className={`overflow-hidden rounded-md border ${
                                                        active ? "border-[#8b6b4f]" : "border-[#e5d8c8]"
                                                    }`}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={imageUrl} alt={property.title} className="h-20 w-full object-cover" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>

                            <div className="rounded-xl border border-[#e5d8c8] bg-[#fffaf3] p-6">
                                <h2 className="text-2xl font-black text-stone-950">Listing details</h2>
                                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-md bg-[#f6ede3] p-4">
                                        <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                            Type
                                        </dt>
                                        <dd className="mt-1 font-black capitalize text-stone-950">
                                            {property.property_type || "property"}
                                        </dd>
                                    </div>
                                    <div className="rounded-md bg-[#f6ede3] p-4">
                                        <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                            Rooms
                                        </dt>
                                        <dd className="mt-1 font-black text-stone-950">
                                            {property.bedrooms || 1}
                                        </dd>
                                    </div>
                                    <div className="rounded-md bg-[#f6ede3] p-4">
                                        <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                            Surface
                                        </dt>
                                        <dd className="mt-1 font-black text-stone-950">
                                            {property.surface || 45} m2
                                        </dd>
                                    </div>
                                    <div className="rounded-md bg-[#f6ede3] p-4">
                                        <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                            Status
                                        </dt>
                                        <dd className="mt-1 font-black capitalize text-stone-950">
                                            {property.status}
                                        </dd>
                                    </div>
                                </dl>
                                <h3 className="mt-8 text-xl font-black text-stone-950">Description</h3>
                                <p className="mt-3 leading-7 text-stone-600">{property.description}</p>
                                <div className="mt-6">
                                    <PropertyCard property={property} agent={agent} agency={agency} />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </section>
            </main>
        </>
    );
}
