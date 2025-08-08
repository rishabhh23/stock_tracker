import { NextResponse } from "next/server";
export const runtime = "edge";

export async function GET() {
  const url = `https://api.upstox.com/v3/login/auth/token/request/${process.env.UPSTOX_API_KEY}`;

  const r = await fetch(url, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_secret: process.env.UPSTOX_SECRET_KEY }),
  });

  if (!r.ok) {
    console.error("Token-request failed:", await r.text());
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Upstox just queues the request; real token arrives after user approval.
  return NextResponse.json({ ok: true });
}
