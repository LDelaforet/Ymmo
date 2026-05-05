"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { fetchAgents } from "@/lib/api";

interface Agent {
    agent_id: number;
    user_id: number;
    agency_id: number;
    specialty: string;
    is_active: boolean;
    user?: { first_name: string; last_name: string; email: string };
}

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAgents() {
        setLoading(true);
        const data = await fetchAgents();
        setAgents(data);
        setLoading(false);
        }

        loadAgents();
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        🤝 Real Estate Agents
                    </h1>

                    {loading ? (
                        <p className="text-gray-600 text-center py-12">Loading agents...</p>
                    ) : agents.length === 0 ? (
                        <p className="text-gray-600 text-center py-12">No agents found</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agents.map((agent) => (
                                <Card key={agent.agent_id} title="">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-lg text-gray-900">
                                                {agent.user?.first_name} {agent.user?.last_name}
                                            </p>
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${agent.is_active
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {agent.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">{agent.user?.email}</p>
                                        <div className="border-t pt-3">
                                            <p className="text-sm text-gray-500">Specialty</p>
                                            <p className="font-semibold text-gray-900">
                                                {agent.specialty || "Not specified"}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded text-sm text-gray-600">
                                            <p>Agency ID: {agent.agency_id}</p>
                                            <p>Agent ID: {agent.agent_id}</p>
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
