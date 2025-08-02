import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("instrument_key");
  if (!key) {
    return NextResponse.json({ data: [] });
  }

  // https://upstox.com/developer/api-documentation/get-market-quote-ohlc/ :contentReference[oaicite:0]{index=0}
  const url = `https://api.upstox.com/v2/market-quote/ohlc?instrument_key=${encodeURIComponent(
    key
  )}&interval=1d`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`,
    },
    cache: "no-store",
  });

  // Grab the raw text so we can surface any error payload for debugging
  const text = await res.text();

  if (!res.ok) {
    // Return the exact status and body from Upstox
    return new NextResponse(`Upstox OHLC error ${res.status}: ${text}`, {
      status: res.status,
    });
  }

  // Parse and forward the JSON
  const json = JSON.parse(text);
  // console.log("Upstox OHLC response:", json);
  return NextResponse.json(json);
}
