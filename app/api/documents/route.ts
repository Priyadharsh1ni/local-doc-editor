import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {

        const token = req.cookies.get("token")?.value;


        const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };

        const body = await req.json();
        const title = body?.title?.trim() || "Untitled Document";

        const [result]: any = await db.query(
            `
      INSERT INTO documents (title, owner_id, content, version, created_by)
      VALUES (?, ?, '', 1, ?)
      `,
            [title, user.id, user.id]
        );

        const documentId = result.insertId;

        await db.query(
            `
      INSERT INTO document_permissions (document_id, user_id, role)
      VALUES (?, ?, 'OWNER')
      `,
            [documentId, user.id]
        );

        return NextResponse.json({ documentId }, { status: 201 });

    } catch (error: any) {

        return NextResponse.json(
            { error: "Failed to create document", details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {

        const auth = req.headers.get("authorization");
        if (!auth || !auth.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: number;
        };

        const [rows]: any = await db.query(
            `
      SELECT
        d.id,
        d.title,
        d.updated_at,
        dp.role
      FROM documents d
      JOIN document_permissions dp
        ON dp.document_id = d.id
      WHERE dp.user_id = ?
      ORDER BY d.updated_at DESC
      `,
            [decoded.id]
        );

        return NextResponse.json({ documents: rows }, { status: 200 });

    } catch (error: any) {
        console.error("GET DOCUMENTS ERROR:", error);

        return NextResponse.json(
            { error: "Failed to fetch documents" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: number;
        };

        const body = await req.json();
        const documentId = body?.documentId;
        const title = body?.title?.trim();

        if (!documentId || !title) {
            return NextResponse.json(
                { error: "Document ID and title are required" },
                { status: 400 }
            );
        }

        const [permissionRows]: any = await db.query(
            `
      SELECT role
      FROM document_permissions
      WHERE document_id = ? AND user_id = ?
      `,
            [documentId, decoded.id]
        );

        const permission = permissionRows?.[0];
        if (!permission || !["OWNER", "EDITOR"].includes(permission.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await db.query(
            `
      UPDATE documents
      SET title = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
            [title, documentId]
        );

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {

        return NextResponse.json(
            { error: "Failed to update document title", details: error.message },
            { status: 500 }
        );
    }
}
