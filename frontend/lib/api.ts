const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: "client" | "agent" | "admin";
}

export interface Agency {
    agency_id: number;
    name: string;
    city: string;
    is_hq: boolean;
}

export interface Agent {
    agent_id: number;
    user_id: number;
    agency_id: number;
    specialty: string;
    is_active: boolean;
    user?: Pick<User, "first_name" | "last_name" | "email">;
    agency?: Agency;
}

export interface Property {
    property_id: number;
    title: string;
    description: string;
    price: number | string;
    location: string;
    status: string;
    agency_id: number;
    agent_id: number;
}

export async function loginUser(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "Invalid email or password");
    }

    return (await response.json()) as User;
}

export async function fetchUsers(): Promise<User[]> {
    try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error("Failed to fetch users");
        return await response.json();
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function fetchUser(id: number): Promise<User | null> {
    try {
        const response = await fetch(`${API_URL}/users/${id}`);
        if (!response.ok) throw new Error("Failed to fetch user");
        return await response.json();
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export async function fetchAgents(): Promise<Agent[]> {
    try {
        const response = await fetch(`${API_URL}/agents`);
        if (!response.ok) throw new Error("Failed to fetch agents");
        return await response.json();
    } catch (error) {
        console.error("Error fetching agents:", error);
        return [];
    }
}

export async function fetchAgent(id: number): Promise<Agent | null> {
    try {
        const response = await fetch(`${API_URL}/agents/${id}`);
        if (!response.ok) throw new Error("Failed to fetch agent");
        return await response.json();
    } catch (error) {
        console.error("Error fetching agent:", error);
        return null;
    }
}

export async function fetchProperties(): Promise<Property[]> {
    try {
        const response = await fetch(`${API_URL}/properties`);
        if (!response.ok) throw new Error("Failed to fetch properties");
        return await response.json();
    } catch (error) {
        console.error("Error fetching properties:", error);
        return [];
    }
}

export async function fetchProperty(id: number): Promise<Property | null> {
    try {
        const response = await fetch(`${API_URL}/properties/${id}`);
        if (!response.ok) throw new Error("Failed to fetch property");
        return await response.json();
    } catch (error) {
        console.error("Error fetching property:", error);
        return null;
    }
}

export async function fetchPropertiesByAgency(agencyId: number): Promise<Property[]> {
    try {
        const response = await fetch(`${API_URL}/properties/agency/${agencyId}`);
        if (!response.ok) throw new Error("Failed to fetch properties");
        return await response.json();
    } catch (error) {
        console.error("Error fetching properties:", error);
        return [];
    }
}

export async function fetchAgencies(): Promise<Agency[]> {
    try {
        const response = await fetch(`${API_URL}/agencies`);
        if (!response.ok) throw new Error("Failed to fetch agencies");
        return await response.json();
    } catch (error) {
        console.error("Error fetching agencies:", error);
        return [];
    }
}

export async function fetchAgency(id: number): Promise<Agency | null> {
    try {
        const response = await fetch(`${API_URL}/agencies/${id}`);
        if (!response.ok) throw new Error("Failed to fetch agency");
        return await response.json();
    } catch (error) {
        console.error("Error fetching agency:", error);
        return null;
    }
}

export async function createUser(user: {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    role?: "client" | "agent" | "admin";
}) {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
        if (!response.ok) throw new Error("Failed to create user");
        return await response.json();
    } catch (error) {
        console.error("Error creating user:", error);
        return null;
    }
}
