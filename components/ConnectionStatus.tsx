"use client";

import { useEffect, useState } from "react";

export default function ConnectionStatus() {
    const [online, setOnline] = useState(true);

    useEffect(() => {
        function update() {
            setOnline(navigator.onLine);
        }

        window.addEventListener("online", update);
        window.addEventListener("offline", update);

        update();
        return () => {
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
        };
    }, []);

    return (
        <div
            className={`fixed bottom-4 right-4 px-3 py-1 rounded text-sm text-white ${online ? "bg-green-600" : "bg-red-600"
                }`}
        >
            {online ? "Online" : "Offline"}
        </div>
    );
}