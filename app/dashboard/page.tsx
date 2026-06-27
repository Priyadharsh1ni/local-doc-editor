"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [docs, setDocs] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    console.log(docs, "docu")
    useEffect(() => {
        fetch("/api/documents", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }).then((res) => res.json())
            .then((data) => setDocs(data.documents))
            .catch((err) => console.error("Error fetching documents:", err));
    }, []);

    const createDocument = async () => {
        if (!title.trim()) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const res = await fetch("/api/documents", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, userId: user.id }),
            });

            const data = await res.json();
            router.push(`/editor/${data.documentId}`);
        } catch (err) {
            console.error("Error creating document:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold mb-4 font-sans text-black">Your Documents</h1>

                    <button
                        onClick={() => setShowModal(true)}
                        className="mb-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-500 transition cursor-pointer"
                    >
                        Create
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {docs?.length > 0 ? docs?.map((doc) => (
                        <Link
                            key={doc.id}
                            href={`/editor/${doc.id}`}
                            className="group rounded-xl bg-white p-4 shadow-lg hover:shadow-xl transition"
                        >
                            <div className="flex flex-col h-full">
                                {/* Icon / Preview */}
                                <div className="mb-3 h-32 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                    Document
                                </div>

                                {/* Title */}
                                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                                    {doc.title || "Untitled document"}
                                </h3>

                                {/* Meta (optional) */}
                                {doc.updated_at && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Updated {new Date(doc.updated_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full flex justify-center items-center h-32">
                            <p className="text-gray-500">No documents found. Create one!</p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">
                            Create New Document
                        </h2>

                        <input
                            type="text"
                            placeholder="Document title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring focus:border-gray-100"
                            autoFocus
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={createDocument}
                                disabled={loading}
                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}