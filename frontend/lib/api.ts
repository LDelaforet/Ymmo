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
    bedrooms?: number;
    surface?: number;
    property_type?: string;
    photo_url?: string;
    created_at?: string;
    agency_id: number;
    agent_id: number;
}

export interface VisitRequest {
    visit_id: number;
    property_id: number;
    user_id?: number | null;
    name: string;
    email: string;
    message: string;
    status: string;
    created_at?: string;
}

export interface Transaction {
    transaction_id: number;
    client_id: number;
    property_id?: number | null;
    agent_id?: number | null;
    agency_id?: number | null;
    transaction_type: string;
    status: string;
    budget?: number | string | null;
    notes: string;
    created_at?: string;
    updated_at?: string;
}

export interface MarketOverview {
    total_properties: number;
    available_properties: number;
    sold_properties: number;
    avg_price: number;
    total_transactions: number;
    transaction_completion_ratio: number;
    market_signal: string;
    city_distribution: Record<string, number>;
    property_type_distribution: Record<string, number>;
    transaction_status_distribution: Record<string, number>;
}

export type PropertyPayload = Omit<Property, "property_id" | "created_at">;

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || `API request failed (${response.status})`);
    }

    return (await response.json()) as T;
}

export async function loginUser(credentials: { email: string; password: string }) {
    return apiRequest<User>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
}

export async function requestPasswordReset(email: string) {
    return apiRequest<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

export async function fetchUsers(): Promise<User[]> {
    return apiRequest<User[]>("/users");
}

export async function fetchUser(id: number): Promise<User> {
    return apiRequest<User>(`/users/${id}`);
}

export async function fetchAgents(): Promise<Agent[]> {
    return apiRequest<Agent[]>("/agents");
}

export async function fetchAgent(id: number): Promise<Agent> {
    return apiRequest<Agent>(`/agents/${id}`);
}

export async function fetchProperties(): Promise<Property[]> {
    return apiRequest<Property[]>("/properties");
}

export async function fetchProperty(id: number): Promise<Property> {
    return apiRequest<Property>(`/properties/${id}`);
}

export async function fetchPropertyGallery(id: number): Promise<string[]> {
    return apiRequest<string[]>(`/properties/${id}/gallery`);
}

export async function fetchPropertiesByAgency(agencyId: number): Promise<Property[]> {
    return apiRequest<Property[]>(`/properties/agency/${agencyId}`);
}

export async function createProperty(property: PropertyPayload): Promise<Property> {
    return apiRequest<Property>("/properties", {
        method: "POST",
        body: JSON.stringify(property),
    });
}

export async function uploadPropertyImages(
    propertyId: number,
    images: File[],
): Promise<{ property_id: number; photo_url: string; images: string[] }> {
    const formData = new FormData();
    for (const image of images) {
        formData.append("images", image);
    }

    const response = await fetch(`${API_URL}/properties/${propertyId}/images`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || `Image upload failed (${response.status})`);
    }

    return (await response.json()) as { property_id: number; photo_url: string; images: string[] };
}

export async function updateProperty(
    propertyId: number,
    property: Partial<PropertyPayload>,
): Promise<Property> {
    return apiRequest<Property>(`/properties/${propertyId}`, {
        method: "PATCH",
        body: JSON.stringify(property),
    });
}

export async function fetchAgencies(): Promise<Agency[]> {
    return apiRequest<Agency[]>("/agencies");
}

export async function fetchAgency(id: number): Promise<Agency> {
    return apiRequest<Agency>(`/agencies/${id}`);
}

export async function createUser(user: {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    role?: "client" | "agent" | "admin";
}) {
    return apiRequest<User>("/users", {
        method: "POST",
        body: JSON.stringify(user),
    });
}

export async function updateUserProfile(
    userId: number,
    payload: Pick<User, "first_name" | "last_name" | "email">,
): Promise<User> {
    return apiRequest<User>(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function changeUserPassword(
    userId: number,
    payload: { current_password: string; new_password: string },
): Promise<{ updated: boolean }> {
    return apiRequest<{ updated: boolean }>(`/users/${userId}/change-password`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function checkEmailAvailability(
    email: string,
    excludeUserId?: number,
): Promise<{ available: boolean }> {
    const params = new URLSearchParams({ email });
    if (excludeUserId !== undefined) {
        params.set("exclude_user_id", String(excludeUserId));
    }
    return apiRequest<{ available: boolean }>(`/users/check-email?${params.toString()}`);
}

export async function deleteUserAccount(userId: number): Promise<{ deleted: boolean }> {
    return apiRequest<{ deleted: boolean }>(`/users/${userId}`, {
        method: "DELETE",
    });
}

export async function createVisitRequest(
    propertyId: number,
    request: {
        user_id?: number;
        name: string;
        email: string;
        message: string;
    },
) {
    return apiRequest<VisitRequest>(`/properties/${propertyId}/visit-requests`, {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export async function fetchVisitRequests(): Promise<VisitRequest[]> {
    return apiRequest<VisitRequest[]>("/visit-requests");
}

export async function fetchTransactions(): Promise<Transaction[]> {
    return apiRequest<Transaction[]>("/transactions");
}

export async function fetchUserTransactions(userId: number): Promise<Transaction[]> {
    return apiRequest<Transaction[]>(`/users/${userId}/transactions`);
}

export async function createTransaction(payload: {
    client_id: number;
    property_id?: number;
    agent_id?: number;
    agency_id?: number;
    transaction_type: string;
    status?: string;
    budget?: number;
    notes?: string;
}) {
    return apiRequest<Transaction>("/transactions", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateTransaction(
    transactionId: number,
    payload: Partial<{
        property_id: number;
        agent_id: number;
        agency_id: number;
        transaction_type: string;
        status: string;
        budget: number;
        notes: string;
    }>,
): Promise<Transaction> {
    return apiRequest<Transaction>(`/transactions/${transactionId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function fetchMarketOverview(): Promise<MarketOverview> {
    return apiRequest<MarketOverview>("/analytics/market-overview");
}

export async function updateVisitRequest(
    visitId: number,
    status: string,
): Promise<VisitRequest> {
    return apiRequest<VisitRequest>(`/visit-requests/${visitId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}

export async function fetchSavedPropertyIds(userId: number): Promise<number[]> {
    return apiRequest<number[]>(`/users/${userId}/saved-properties`);
}

export async function savePropertyForUser(userId: number, propertyId: number) {
    return apiRequest(`/users/${userId}/saved-properties/${propertyId}`, {
        method: "POST",
    });
}

export async function removeSavedPropertyForUser(userId: number, propertyId: number) {
    return apiRequest<{ removed: boolean }>(`/users/${userId}/saved-properties/${propertyId}`, {
        method: "DELETE",
    });
}
