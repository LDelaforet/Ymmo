"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { changeUserPassword, deleteUserAccount } from "@/lib/api";

export default function PrivacyPage() {
    const router = useRouter();
    const { user, ready, logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (ready && !user) {
            router.push("/login");
        }
    }, [ready, user, router]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!user) return;
        setError("");
        setNotice("");
        if (newPassword.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("The new password confirmation does not match.");
            return;
        }

        setLoading(true);
        try {
            await changeUserPassword(user.id, {
                current_password: currentPassword,
                new_password: newPassword,
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setNotice("Your password has been updated.");
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Could not change password.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteAccount() {
        if (!user) return;
        setError("");
        setNotice("");
        if (deleteConfirmText !== "DELETE") {
            setError('Type "DELETE" to confirm account deletion.');
            return;
        }

        setDeleting(true);
        try {
            await deleteUserAccount(user.id);
            logout();
            router.push("/");
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Could not delete account.");
        } finally {
            setDeleting(false);
        }
    }

    if (!ready || !user) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-stone-50 p-8 text-center text-stone-600">
                    Loading privacy settings...
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
                        <h1 className="mt-2 text-4xl font-black text-stone-950">Privacy settings</h1>
                        <p className="mt-3 text-stone-600">
                            Keep your account secure by updating your password regularly.
                        </p>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr]">
                    <aside className="rounded-lg border border-stone-200 bg-white p-3">
                        <nav className="grid gap-2">
                            <Link
                                href="/profile"
                                className="rounded-md px-3 py-2 text-sm font-bold text-stone-700 hover:bg-stone-100"
                            >
                                Personal info
                            </Link>
                            <Link
                                href="/profile/privacy"
                                className="rounded-md bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-800"
                            >
                                Privacy
                            </Link>
                        </nav>
                    </aside>

                    <section className="rounded-lg border border-stone-200 bg-white p-6">
                        <h2 className="text-2xl font-black text-stone-950">Change password</h2>
                        <p className="mt-2 text-sm text-stone-600">
                            New passwords must contain at least 8 characters.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <label className="block text-sm font-bold text-stone-700">
                                Current password
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                    className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 font-normal text-stone-950 outline-none focus:border-emerald-700"
                                    required
                                />
                            </label>

                            <label className="block text-sm font-bold text-stone-700">
                                New password
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 font-normal text-stone-950 outline-none focus:border-emerald-700"
                                    required
                                />
                            </label>

                            <label className="block text-sm font-bold text-stone-700">
                                Confirm new password
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 font-normal text-stone-950 outline-none focus:border-emerald-700"
                                    required
                                />
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
                                disabled={loading || deleting}
                                className="min-h-11 rounded-md bg-emerald-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                            >
                                {loading ? "Updating..." : "Update password"}
                            </button>
                        </form>

                        <div className="mt-10 border-t border-stone-200 pt-6">
                            <h3 className="text-xl font-black text-stone-950">Delete account</h3>
                            <p className="mt-2 text-sm text-stone-600">
                                This action is permanent. Type <span className="font-bold">DELETE</span> to confirm.
                            </p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                                <input
                                    value={deleteConfirmText}
                                    onChange={(event) => setDeleteConfirmText(event.target.value)}
                                    placeholder='Type "DELETE"'
                                    className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-stone-950 outline-none focus:border-red-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    disabled={deleting || loading}
                                    className="min-h-11 rounded-md bg-red-700 px-5 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                                >
                                    {deleting ? "Deleting..." : "Delete account"}
                                </button>
                            </div>
                        </div>
                    </section>
                </section>
            </main>
        </>
    );
}
