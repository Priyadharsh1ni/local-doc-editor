import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;

  const token = auth.split(" ")[1];
  try {
    return verifyToken(token) as { id: number };
  } catch {
    return null;
  }
}