import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
        const auth = req.headers.get("authorization");
        if (!auth || !auth.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = auth.split(" ")[1];
        const decoded = await verifyToken(token);
    const { documentId, content } = await req.json();


    const [perm]: any = await db.query(
        `
    SELECT role FROM document_permissions
    WHERE document_id = ? AND user_id = ?
    `,
        [documentId, decoded.id]
    );

    if (!perm.length || perm[0].role === "VIEWER") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.query(
        `
    UPDATE documents
    SET content = ?, version = version + 1, updated_at = NOW()
    WHERE id = ?
    `,
        [content, documentId]
    );

    return NextResponse.json({ success: true });
}