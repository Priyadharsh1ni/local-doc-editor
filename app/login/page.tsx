"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok || !data.token) {
            setError(data.error || "Login failed");
            return;
        }

        localStorage.setItem("token", data.token);
        document.cookie = `token=${data.token}; path=/; max-age=604800`;
        router.push("/dashboard"); localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        await router.push("/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-md bg-white p-6 rounded shadow-xl "
            >
                <h1 className="text-2xl font-semibold mb-4">Login</h1>

                {error && <p className="text-red-500 mb-3">{error}</p>}

                <input
                    className="w-full border p-2 mb-3 rounded"
                    placeholder="Email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />

                <input
                    className="w-full border p-2 mb-4 rounded"
                    placeholder="Password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                <button className="w-full bg-black text-white py-2 rounded">
                    Sign In
                </button>
                <p className="mt-4 text-sm text-gray-600">
                    Don't have an account?{" "}
                    <a href="/register" className="text-blue-600 hover:underline">
                        Register
                    </a>
                </p>
            </form>
        </div>
    );
}
