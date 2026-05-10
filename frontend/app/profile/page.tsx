"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { checkEmailAvailability, updateUserProfile } from "@/lib/api";

export default function ProfilePage() {
    const router = useRouter();
    const { user, ready, updateCurrentUser } = useAuth();
    const [draft, setDraft] = useState<{
        first_name: string;
        last_name: string;
        email: string;
    } | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [emailFeedback, setEmailFeedback] = useState("");
    const [emailAvailable, setEmailAvailable] = useState(true);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [loading, setLoading] = useState(false);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    useEffect(() => {
        if (ready && !user) {
            router.push("/login");
        }
    }, [ready, user, router]);

    const formValues = useMemo(() => {
        if (!user) {
            return { first_name: "", last_name: "", email: "" };
        }
        return draft ?? {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        };
    }, [draft, user]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user) return;
        setError("");
        setNotice("");
        setEmailFeedback("");
        const emailValue = formValues.email.trim();
        if (!emailPattern.test(emailValue)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (emailValue.toLowerCase() !== user.email.toLowerCase()) {
            setCheckingEmail(true);
            try {
                const availability = await checkEmailAvailability(emailValue, user.id);
                if (!availability.available) {
                    setError("This email is already used by another account.");
                    setEmailAvailable(false);
                    setEmailFeedback("This email is already taken.");
                    return;
                }
                setEmailAvailable(true);
            } catch (checkError) {
                setError(checkError instanceof Error ? checkError.message : "Could not validate email.");
                return;
            } finally {
                setCheckingEmail(false);
            }
        }

        setLoading(true);
        try {
            const updated = await updateUserProfile(user.id, {
                first_name: formValues.first_name.trim(),
                last_name: formValues.last_name.trim(),
                email: emailValue,
            });
            updateCurrentUser(updated);
            setDraft(null);
            setNotice("Your profile has been updated.");
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Could not update profile.");
        } finally {
            setLoading(false);
        }
    }

    async function handleEmailBlur() {
        if (!user) return;
        const value = formValues.email.trim();
        if (!value) return;
        if (!emailPattern.test(value)) {
            setEmailAvailable(false);
            setEmailFeedback("Please enter a valid email address.");
            return;
        }
        if (value.toLowerCase() === user.email.toLowerCase()) {
            setEmailAvailable(true);
            setEmailFeedback("");
            return;
        }

        setCheckingEmail(true);
        try {
            const availability = await checkEmailAvailability(value, user.id);
            setEmailAvailable(availability.available);
            setEmailFeedback(availability.available ? "Email available." : "This email is already taken.");
        } catch (checkError) {
            setEmailAvailable(false);
            setEmailFeedback(checkError instanceof Error ? checkError.message : "Could not validate email.");
        } finally {
            setCheckingEmail(false);
        }
    }

    if (!ready || !user) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-stone-50 p-8 text-center text-stone-600">
                    Loading profile...
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50">
                <section className="border-b border-stone-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                            Account
                        </p>
                        <h1 className="mt-2 text-4xl font-black text-stone-950">Profile settings</h1>
                        <p className="mt-3 text-stone-600">
                            Manage your personal details and account privacy settings.
                        </p>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr]">
                    <aside className="rounded-lg border border-stone-200 bg-white p-3">
                        <nav className="grid gap-2">
                            <Link
                                href="/profile"
                                className="rounded-md bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-800"
                            >
                                Personal info
                            </Link>
                            <Link
                                href="/profile/privacy"
                                className="rounded-md px-3 py-2 text-sm font-bold text-stone-700 hover:bg-stone-100"
                            >
                                Privacy
                            </Link>
                        </nav>
                    </aside>

                    <section className="rounded-lg border border-stone-200 bg-white p-6">
                        <h2 className="text-2xl font-black text-stone-950">Personal information</h2>
                        <p className="mt-2 text-sm text-stone-600">
                            Update your name and email used in your account.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block text-sm font-bold text-stone-700">
                                    First name
                                    <input
                                        value={formValues.first_name}
                                        onChange={(event) =>
                                            setDraft((current) => ({
                                                first_name: event.target.value,
                                                last_name: current?.last_name ?? user.last_name,
                                                email: current?.email ?? user.email,
                                            }))
                                        }
                                        className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 font-normal text-stone-950 outline-none focus:border-emerald-700"
                                        required
                                    />
                                </label>
                                <label className="block text-sm font-bold text-stone-700">
                                    Last name
                                    <input
                                        value={formValues.last_name}
                                        onChange={(event) =>
                                            setDraft((current) => ({
                                                first_name: current?.first_name ?? user.first_name,
                                                last_name: event.target.value,
                                                email: current?.email ?? user.email,
                                            }))
                                        }
                                        className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 font-normal text-stone-950 outline-none focus:border-emerald-700"
                                        required
                                    />
                                </label>
                            </div>

                            <label className="block text-sm font-bold text-stone-700">
                                Email
                                <input
                                    type="email"
                                    value={formValues.email}
                                    onChange={(event) =>
                                        setDraft((current) => ({
                                            first_name: current?.first_name ?? user.first_name,
                                            last_name: current?.last_name ?? user.last_name,
                                            email: event.target.value,
                                        }))
                                    }
                                    onBlur={handleEmailBlur}
                                    className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 font-normal text-stone-950 outline-none focus:border-emerald-700"
                                    required
                                />
                                <p
                                    className={`mt-2 text-xs font-semibold ${
                                        emailFeedback
                                            ? emailAvailable
                                                ? "text-emerald-700"
                                                : "text-red-700"
                                            : "text-stone-500"
                                    }`}
                                >
                                    {checkingEmail
                                        ? "Checking email availability..."
                                        : emailFeedback || "Use an email that only you can access."}
                                </p>
                            </label>

                            {error ? (
                                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                    {error}
                                </p>
                            ) : null}
                            {notice ? (
                                <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                                    {notice}
                                </p>
                            ) : null}

                            <button
                                type="submit"
                                disabled={loading || checkingEmail || !emailAvailable}
                                className="min-h-11 rounded-md bg-emerald-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                            >
                                {loading ? "Saving..." : "Save changes"}
                            </button>
                        </form>
                    </section>
                </section>
            </main>
        </>
    );
}
