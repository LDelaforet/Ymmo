"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { loginUser, type User } from "@/lib/api";

interface AuthContextValue {
    user: User | null;
    isAgent: boolean;
    isClient: boolean;
    isAdmin: boolean;
    ready: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    updateCurrentUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "ymmo.currentUser";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        queueMicrotask(() => {
            const storedUser = window.localStorage.getItem(STORAGE_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setReady(true);
        });
    }, []);

    async function login(email: string, password: string) {
        const loggedUser = await loginUser({ email, password });
        setUser(loggedUser);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
        return loggedUser;
    }

    function logout() {
        setUser(null);
        window.localStorage.removeItem(STORAGE_KEY);
    }

    function updateCurrentUser(updatedUser: User) {
        setUser(updatedUser);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    }

    const value = useMemo(
        () => ({
            user,
            ready,
            login,
            logout,
            updateCurrentUser,
            isAgent: user?.role === "agent" || user?.role === "admin",
            isClient: user?.role === "client" || user?.role === "agent" || user?.role === "admin",
            isAdmin: user?.role === "admin",
        }),
        [user, ready],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}
