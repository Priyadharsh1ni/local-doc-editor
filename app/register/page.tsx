"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [user, setUser] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: user.name, email: user.email, password: user.password })
        });

        if (!res.ok) {
            setError("Registration failed");
            return;
        }

        router.push("/login");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form className="w-full max-w-md bg-white p-6 rounded shadow-xl">
                <h1 className="text-2xl font-semibold mb-4">Register</h1>

                {error && <p className="text-red-500 mb-3">{error}</p>}

                <input
                    className="w-full border p-2 mb-3 rounded"
                    placeholder="name"
                    type="text"
                    required
                    value={user.name}
                    onChange={e => setUser({ ...user, name: e.target.value })}
                />

                <input
                    className="w-full border p-2 mb-3 rounded"
                    placeholder="Email"
                    type="email"
                    required
                    value={user.email}
                    onChange={e => setUser({ ...user, email: e.target.value })}
                />

                <input
                    className="w-full border p-2 mb-4 rounded"
                    placeholder="Password"
                    type="password"
                    required
                    value={user.password}
                    onChange={e => setUser({ ...user, password: e.target.value })}
                />

                <button
                    onClick={handleRegister}
                    className="w-full bg-black text-white py-2 rounded"
                >
                    Create Account
                </button>
            </form>
        </div>
    );
}