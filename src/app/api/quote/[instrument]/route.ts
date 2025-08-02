import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: {
    // `params` is now a Promise that must be awaited
    params: Promise<{ instrument: string }>;
  }
) {
  // 1) Await the params before using
  const { instrument } = await context.params; // :contentReference[oaicite:0]{index=0}
  const key = decodeURIComponent(instrument);

  // 2) Build and call the Upstox quote endpoint
  const url = `https://api-v2.upstox.com/market-quote/quotes?instrument_key=${key}`;
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return new NextResponse("Upstox error", { status: res.status });
  }

  // 3) Parse and return the JSON
  const { data } = await res.json();
  const lastPrice = data?.[0]?.last_price ?? null;
  return NextResponse.json({ price: lastPrice });
}
