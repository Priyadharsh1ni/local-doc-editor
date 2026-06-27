import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { name, email, password } = await req.json();

    const [rows]: any = await db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
        token: signToken({ id: user.id }),
        user: { id: user.id, name: user.name, email: user.email },
    });
}