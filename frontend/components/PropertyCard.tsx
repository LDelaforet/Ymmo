"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createVisitRequest, type Agent, type Agency, type Property } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
const API_BASE_URL = "http://127.0.0.1:8000"; // Or whatever port Python is running on

interface PropertyCardProps {
    property: Property;
    agent?: Agent;
    agency?: Agency;
    showAgentTools?: boolean;
    leadCount?: number;
    onReviewLeads?: (property: Property) => void;
    onStatusChange?: (propertyId: number, status: string) => void;
}

const statusStyles: Record<string, string> = {
    available: "bg-[#e9dbc9] text-[#6d523d]",
    sold: "bg-stone-200 text-stone-700",
    reserved: "bg-amber-100 text-amber-800",
    pending: "bg-sky-100 text-sky-800",
    archived: "bg-red-100 text-red-800",
};

const propertyTypeLabels: Record<string, string> = {
    apartment: "Apartment",
    house: "House",
    studio: "Studio",
    loft: "Loft",
};

export function formatPrice(price: number | string) {
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price;

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(Number.isNaN(numericPrice) ? 0 : numericPrice);
}

export default function PropertyCard({
    property,
    agent,
    agency,
    showAgentTools = false,
    leadCount = 0,
    onReviewLeads,
    onStatusChange,
}: PropertyCardProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [visitOpen, setVisitOpen] = useState(false);
    const [visitMessage, setVisitMessage] = useState("");
    const [visitError, setVisitError] = useState("");
    const [visitSuccess, setVisitSuccess] = useState("");
    const [submittingVisit, setSubmittingVisit] = useState(false);

    const normalizedStatus = property.status?.toLowerCase() || "available";
    const statusClass = statusStyles[normalizedStatus] || "bg-stone-100 text-stone-700";
    const imageSeed = property.property_id % 4;
    const imageClass = [
        "from-[#a78668] via-[#8b6b4f] to-[#c9a889]",
        "from-[#b1957b] via-[#8f735a] to-[#d6b79a]",
        "from-[#927863] via-[#7c6450] to-[#c8a485]",
        "from-[#ac8f72] via-[#8e6f56] to-[#d7b89d]",
    ][imageSeed];
    const details = useMemo(
        () => [
            propertyTypeLabels[property.property_type || ""] || property.property_type || "Property",
            `${property.bedrooms || 1} room${(property.bedrooms || 1) > 1 ? "s" : ""}`,
            `${property.surface || 45} m2`,
        ],
        [property.bedrooms, property.property_type, property.surface],
    );

    const fullImageUrl = `${API_BASE_URL}${property.photo_url}`;

    async function handleVisitSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setVisitError("");
        setVisitSuccess("");

        if (!user) {
            router.push("/login");
            return;
        }

        setSubmittingVisit(true);
        try {
            await createVisitRequest(property.property_id, {
                user_id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                message: visitMessage,
            });
            setVisitMessage("");
            setVisitSuccess("Visit request sent. The agent can now review it from the office.");
        } catch (error) {
            setVisitError(error instanceof Error ? error.message : "Could not request this visit.");
        } finally {
            setSubmittingVisit(false);
        }
    }

    return (
        <article className="overflow-hidden rounded-xl border border-[#e5d8c8] bg-[#fffaf3] shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className={`relative h-56 bg-linear-to-br ${imageClass}`}>
                {property.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={fullImageUrl}
                        alt={property.title}
                        className="h-full w-full object-cover"
                    />
                ) : null}
                <div className="absolute right-4 top-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize shadow-sm ${statusClass}`}>
                        {property.status}
                    </span>
                </div>
                <div className="absolute inset-x-4 bottom-4 rounded-md bg-[#fffaf3]/90 p-4 shadow-sm backdrop-blur">
                    <p className="text-2xl font-black text-[#2f241f]">{formatPrice(property.price)}</p>
                    <p className="mt-1 text-sm font-medium text-[#6a5443]">{property.location}</p>
                </div>
            </div>

            <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-black text-[#2f241f]">{property.title}</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-[#5a4738]">
                    {details.map((detail) => (
                        <span key={detail} className="rounded-md bg-[#f3e7d8] px-2 py-2">
                            {detail}
                        </span>
                    ))}
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-[#6a5443]">{property.description}</p>

                <div className="grid gap-3 border-t border-stone-100 pt-4 text-sm text-stone-600">
                    <div>
                        <span className="block text-xs font-bold uppercase tracking-wide text-stone-400">
                            Agent
                        </span>
                        <span className="font-semibold text-stone-800">
                            {agent?.user
                                ? `${agent.user.first_name} ${agent.user.last_name}`
                                : `Agent #${property.agent_id}`}
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold uppercase tracking-wide text-stone-400">
                            Agency
                        </span>
                        <span className="font-semibold text-stone-800">
                            {agency ? `${agency.name}, ${agency.city}` : `Agency #${property.agency_id}`}
                        </span>
                    </div>
                </div>

                {showAgentTools ? (
                    <div className="grid gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => onReviewLeads?.(property)}
                            className="rounded-md bg-stone-950 px-3 py-2 text-sm font-semibold text-white"
                        >
                            Review lead{leadCount === 1 ? "" : "s"} ({leadCount})
                        </button>
                        <select
                            value={property.status}
                            onChange={(event) => onStatusChange?.(property.property_id, event.target.value)}
                            className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800"
                        >
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="reserved">Reserved</option>
                            <option value="sold">Sold</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                ) : (
                    <div className="grid gap-2 pt-1 sm:grid-cols-2">
                        <Link
                            href={`/properties/${property.property_id}`}
                            className="rounded-md border border-[#d9c7b3] bg-[#fffaf3] px-3 py-3 text-center text-sm font-bold text-[#2f241f] transition hover:bg-[#efe4d6]"
                        >
                            View details
                        </Link>
                        <button
                            type="button"
                            onClick={() => (user ? setVisitOpen((current) => !current) : router.push("/login"))}
                            className="rounded-md bg-[#8b6b4f] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#775a43]"
                        >
                            Request a visit
                        </button>
                    </div>
                )}

                {visitOpen ? (
                    <form onSubmit={handleVisitSubmit} className="space-y-3 rounded-md bg-stone-50 p-3">
                        <textarea
                            value={visitMessage}
                            onChange={(event) => setVisitMessage(event.target.value)}
                            placeholder="Preferred date, questions, or contact details"
                            className="min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-950 outline-none focus:border-[#8b6b4f]"
                        />
                        {visitError ? (
                            <p className="text-sm font-semibold text-red-700">{visitError}</p>
                        ) : null}
                        {visitSuccess ? (
                            <p className="text-sm font-semibold text-[#8b6b4f]">{visitSuccess}</p>
                        ) : null}
                        <button
                            type="submit"
                            disabled={submittingVisit}
                            className="w-full rounded-md bg-stone-950 px-3 py-2 text-sm font-bold text-white disabled:bg-stone-400"
                        >
                            {submittingVisit ? "Sending..." : "Send request"}
                        </button>
                    </form>
                ) : null}
            </div>
        </article>
    );
}
