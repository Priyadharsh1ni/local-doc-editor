import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = auth.split(" ")[1];
  const user = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

  const { documentId, targetUserId, role } = await req.json();

  const [owner]: any = await db.query(
    `
    SELECT 1 FROM document_permissions
    WHERE document_id = ? AND user_id = ? AND role = 'OWNER'
    `,
    [documentId, user.userId]
  );

  if (!owner.length) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.query(
    `
    INSERT INTO document_permissions (document_id, user_id, role)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE role = VALUES(role)
    `,
    [documentId, targetUserId, role]
  );

  return NextResponse.json({ success: true });
}