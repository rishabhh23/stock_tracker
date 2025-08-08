import { kv } from "@vercel/kv"; // 1-line import, no extra config
import { NextResponse } from "next/server";
export const runtime = "edge";

export async function POST(req: Request) {
  const payload = await req.json(); // { access_token, expires_at, ... }

  // Save under the *same* name you use elsewhere
  await kv.set("UPSTOX_ACCESS_TOKEN", payload.access_token);
  await kv.set("UPSTOX_ACCESS_TOKEN_EXPIRES", Number(payload.expires_at));

  return NextResponse.json({ ok: true });
}
