"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { fetchUsers, createUser } from "@/lib/api";

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({
        first_name: "",
        last_name: "",
        email: "",
    });

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
        setLoading(false);
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault();
        await createUser(newUser);
        setNewUser({ first_name: "", last_name: "", email: "" });
        loadUsers();
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">👥 Users</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card title="Add New User" className="lg:col-span-1">
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={newUser.first_name}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, first_name: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={newUser.last_name}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, last_name: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newUser.email}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, email: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                                >
                                    Create User
                                </button>
                            </form>
                        </Card>

                        <div className="lg:col-span-2 space-y-4">
                            {loading ? (
                                <p className="text-gray-600 text-center py-8">
                                    Loading users...
                                </p>
                            ) : users.length === 0 ? (
                                <p className="text-gray-600 text-center py-8">
                                    No users found
                                </p>
                            ) : (
                                users.map((user) => (
                                    <Card key={user.id} title="">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-lg text-gray-900">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                                <p className="text-gray-600">{user.email}</p>
                                                <p className="text-sm text-blue-600 font-semibold mt-2">
                                                    Role: {user.role}
                                                </p>
                                            </div>
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                ID: {user.id}
                                            </span>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
