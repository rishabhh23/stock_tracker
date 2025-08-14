import { NextResponse } from "next/server";

/**
 * Kicks off the "Access Token Request" flow.
 * You (the user) will get an approval prompt in Upstox app/web/WhatsApp.
 * After approval, Upstox POSTs the access_token to /api/upstox/notifier.
 *
 * Docs: "Access Token Request for User"
 * Confirm the current endpoint in docs/Postman; this follows Upstox guidance.
 */
export async function GET() {
  const clientId = process.env.UPSTOX_API_KEY!;
  const clientSecret = process.env.UPSTOX_SECRET_KEY!;

  // As of their docs, the request is initiated server-to-server.
  // Endpoint shape is per Upstox "Access Token Request" docs.
  const url = `https://api.upstox.com/v3/login/auth/token/request/${clientId}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({ client_secret: clientSecret }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
