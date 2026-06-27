import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;


        const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
        const { documentId, snapshot, startBlockIndex, baseVersion } =
            await req.json();

        if (!documentId || !snapshot) {
            return NextResponse.json(
                { error: "documentId and snapshot required" },
                { status: 400 }
            );
        }

        await db.execute(
            `
      INSERT INTO document_versions
      (document_id, snapshot, start_block_index, base_version, created_by)
      VALUES (?, ?, ?, ?, ?)
      `,
            [
                documentId,
                snapshot,
                startBlockIndex ?? 0,
                baseVersion ?? 0, 
                user.id,

            ]
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to create version" },
            { status: 500 }
        );
    }
}


export async function GET(req: NextRequest) {
    const documentId = req.nextUrl.searchParams.get("documentId");

    if (!documentId) {
        return NextResponse.json(
            { error: "documentId required" },
            { status: 400 }
        );
    }

    const [rows] = await db.execute(
        `
    SELECT 
      id,
      snapshot,
      start_block_index,
      base_version,
      created_at
    FROM document_versions
    WHERE document_id = ?
    ORDER BY created_at DESC
    `,
        [documentId]
    );

    return NextResponse.json(rows);
}