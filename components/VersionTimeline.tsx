"use client";

import { useEffect, useState } from "react";

export default function VersionTimeline({
    documentId,
    onSelectVersion,
}: {
    documentId: number;
    onSelectVersion: (version: any) => void;
}) {
    const [versions, setVersions] = useState<any[]>([]);

    useEffect(() => {
        fetch(`/api/versions?documentId=${documentId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then(res => res.json())
            .then(setVersions);
    }, [documentId]);

    return (
        <>
            <div
                className="p-6 mt-1 overflow-y-auto h-[100vh] flex flex-col gap-5 shadow-xl bg-gray-50 rounded hide-scrollbar"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                <h3 className="font-semibold mb-2">Version History</h3>

                {versions.length > 0 ? versions.map(v => (
                    <div
                        key={v.id}
                        className="text-sm mb-2 cursor-pointer shadow-sm p-2 rounded hover:bg-gray-100"
                        onClick={() => onSelectVersion(v)}
                    >
                        {new Date(v.created_at).toLocaleString()}
                    </div>
                )): <p>No versions found.</p>}
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </>
    );
}