import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

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

        const token = req.cookies.get("token")?.value;


        const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

        const [rows]: any = await db.query(
            `
      SELECT id, title, content
      FROM documents
      WHERE id = ? AND created_by = ?
      `,
            [documentId, user.id]
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