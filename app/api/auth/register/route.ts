import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  const hash = await bcrypt.hash(password, 10);

  await db.execute(
    "INSERT INTO users (name, email, password_hash) VALUES (?,?,?)",
    [name, email, hash]
  );

  return NextResponse.json({ success: true });
}