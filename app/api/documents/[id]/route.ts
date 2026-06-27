import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const documentId = Number(id);

        if (!documentId) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

               const auth = req.headers.get("authorization");
        if (!auth || !auth.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = auth.split(" ")[1];
        const decoded = await verifyToken(token);

        const [rows]: any = await db.query(
            `
      SELECT id, title, content
      FROM documents
      WHERE id = ? AND created_by = ?
      `,
            [documentId, decoded.id]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json(
                { error: "Document not found or access denied" },
                { status: 404 }
            );
        }

        return NextResponse.json(rows[0]);
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}