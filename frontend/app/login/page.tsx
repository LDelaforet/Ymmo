"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { createUser } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (mode === "register") {
                const createdUser = await createUser({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    role: "client",
                });

                if (!createdUser) {
                    throw new Error("Could not create your account.");
                }
            }

            const loggedUser = await login(email, password);
            router.push(loggedUser.role === "agent" || loggedUser.role === "admin" ? "/agent" : "/dashboard");
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50">
                <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                            Secure access
                        </p>
                        <h1 className="mt-2 text-3xl font-black text-stone-950">
                            {mode === "login" ? "Log in to Ymmo" : "Create a client account"}
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-stone-600">
                            Clients get a search dashboard. Agents use the same login and unlock the agent office automatically from their role.
                        </p>

                        <div className="mt-6 grid grid-cols-2 rounded-md border border-stone-200 bg-stone-100 p-1">
                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className={`rounded px-3 py-2 text-sm font-bold ${
                                    mode === "login" ? "bg-white text-stone-950 shadow-sm" : "text-stone-600"
                                }`}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("register")}
                                className={`rounded px-3 py-2 text-sm font-bold ${
                                    mode === "register" ? "bg-white text-stone-950 shadow-sm" : "text-stone-600"
                                }`}
                            >
                                Register
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            {mode === "register" ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block text-sm font-bold text-stone-700">
                                        First name
                                        <input
                                            value={firstName}
                                            onChange={(event) => setFirstName(event.target.value)}
                                            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 font-normal text-stone-950 outline-none focus:border-emerald-700"
                                            required
                                        />
                                    </label>
                                    <label className="block text-sm font-bold text-stone-700">
                                        Last name
                                        <input
                                            value={lastName}
                                            onChange={(event) => setLastName(event.target.value)}
                                            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 font-normal text-stone-950 outline-none focus:border-emerald-700"
                                            required
                                        />
                                    </label>
                                </div>
                            ) : null}

                            <label className="block text-sm font-bold text-stone-700">
                                Email
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 font-normal text-stone-950 outline-none focus:border-emerald-700"
                                    required
                                />
                            </label>

                            <label className="block text-sm font-bold text-stone-700">
                                Password
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 font-normal text-stone-950 outline-none focus:border-emerald-700"
                                    required
                                />
                            </label>

                            {error ? (
                                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                    {error}
                                </p>
                            ) : null}

                            <button
                                type="submit"
                                disabled={loading}
                                className="min-h-11 w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                            >
                                {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
                            </button>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-stone-200 bg-stone-950 text-white shadow-xl">
                        <div className="h-80 bg-[linear-gradient(140deg,#14532d_0%,#292524_50%,#f59e0b_100%)] p-6">
                            <div className="grid h-full grid-cols-6 grid-rows-5 gap-3">
                                <div className="col-span-4 row-span-5 rounded-md bg-white/15" />
                                <div className="col-span-2 row-span-2 rounded-md bg-white/25" />
                                <div className="col-span-2 row-span-3 rounded-md bg-emerald-300/60" />
                            </div>
                        </div>
                        <div className="p-6">
                            <h2 className="text-2xl font-black">Two interfaces, one account.</h2>
                            <p className="mt-3 leading-7 text-stone-300">
                                Client users land in their search hub. Agent users can browse the client side and access inventory tools from the agent office.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
