import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

    const { documentId, content } = await req.json();


    const [perm]: any = await db.query(
        `
    SELECT role FROM document_permissions
    WHERE document_id = ? AND user_id = ?
    `,
        [documentId, user.id]
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