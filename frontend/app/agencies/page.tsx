"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { fetchAgencies } from "@/lib/api";

interface Agency {
    agency_id: number;
    name: string;
    city: string;
    is_hq: boolean;
}

export default function AgenciesPage() {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAgencies() {
        setLoading(true);
        const data = await fetchAgencies();
        setAgencies(data);
        setLoading(false);
        }

        loadAgencies();
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-linear-to-br from-orange-50 to-red-100 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        🏢 Real Estate Agencies
                    </h1>

                    {loading ? (
                        <p className="text-gray-600 text-center py-12">
                            Loading agencies...
                        </p>
                    ) : agencies.length === 0 ? (
                        <p className="text-gray-600 text-center py-12">
                            No agencies found
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agencies.map((agency) => (
                                <Card key={agency.agency_id} title="">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-xl text-gray-900">
                                                {agency.name}
                                            </p>
                                            {agency.is_hq && (
                                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                                                    HQ
                                                </span>
                                            )}
                                        </div>

                                        <div className="border-t pt-4">
                                            <p className="text-gray-600 text-sm mb-1">Location</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                📍 {agency.city}
                                            </p>
                                        </div>

                                        <div className="bg-linear-to-r from-orange-50 to-red-50 p-3 rounded">
                                            <p className="text-sm text-gray-600">Agency ID</p>
                                            <p className="text-2xl font-bold text-orange-600">
                                                {agency.agency_id}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
