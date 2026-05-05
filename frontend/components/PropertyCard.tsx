import type { Agent, Agency, Property } from "@/lib/api";

interface PropertyCardProps {
    property: Property;
    agent?: Agent;
    agency?: Agency;
    showAgentTools?: boolean;
}

const statusStyles: Record<string, string> = {
    available: "bg-emerald-100 text-emerald-800",
    sold: "bg-stone-200 text-stone-700",
    reserved: "bg-amber-100 text-amber-800",
    pending: "bg-sky-100 text-sky-800",
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
}: PropertyCardProps) {
    const normalizedStatus = property.status?.toLowerCase() || "available";
    const statusClass = statusStyles[normalizedStatus] || "bg-stone-100 text-stone-700";
    const imageSeed = property.property_id % 4;
    const imageClass = [
        "from-emerald-900 via-stone-700 to-amber-500",
        "from-sky-900 via-stone-700 to-emerald-400",
        "from-stone-900 via-rose-700 to-amber-400",
        "from-teal-900 via-slate-700 to-lime-400",
    ][imageSeed];

    return (
        <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className={`relative h-48 bg-gradient-to-br ${imageClass}`}>
                <div className="absolute inset-x-5 bottom-5 rounded-md bg-white/90 p-4 shadow-sm backdrop-blur">
                    <p className="text-2xl font-bold text-stone-950">{formatPrice(property.price)}</p>
                    <p className="mt-1 text-sm font-medium text-stone-600">{property.location}</p>
                </div>
            </div>

            <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-stone-950">{property.title}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass}`}>
                        {property.status}
                    </span>
                </div>

                <p className="line-clamp-3 text-sm leading-6 text-stone-600">{property.description}</p>

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
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <button className="rounded-md bg-stone-950 px-3 py-2 text-sm font-semibold text-white">
                            Review lead
                        </button>
                        <button className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-800">
                            Update status
                        </button>
                    </div>
                ) : (
                    <button className="w-full rounded-md bg-emerald-700 px-3 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">
                        Request a visit
                    </button>
                )}
            </div>
        </article>
    );
}
