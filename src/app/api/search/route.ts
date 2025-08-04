import { NextRequest, NextResponse } from "next/server";
import { gunzip } from "zlib";
import { promisify } from "util";

const gunzipAsync = promisify(gunzip);
export const runtime = "nodejs";

/** in-memory cache for this Node.js instance */
let cachedInstruments: Array<{
  trading_symbol: string;
  instrument_key: string;
  name: string;
  exchange: string;
  instrument_type: string;
}> | null = null;

export async function GET(req: NextRequest) {
  const query = (req.nextUrl.searchParams.get("query") || "").toLowerCase();
  if (!query) return NextResponse.json({ results: [] });

  // Load + gunzip + parse exactly once per cold-start
  if (!cachedInstruments) {
    const url =
      "https://assets.upstox.com/market-quote/instruments/exchange/complete.json.gz";

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Compatible; Upstox API Client)",
      },
    });
    if (!res.ok)
      return new NextResponse("Failed to fetch instruments", {
        status: res.status,
      });

    const zipped = Buffer.from(await res.arrayBuffer());
    const jsonBuf = await gunzipAsync(zipped);
    cachedInstruments = JSON.parse(jsonBuf.toString("utf8"));
  }

  // Filter top 10 matches
  const results = cachedInstruments!
    .filter(
      (inst) =>
        inst.instrument_type === "EQ" &&
        inst.trading_symbol.toLowerCase().includes(query)
    )
    .slice(0, 10)
    .map((inst) => ({
      instrument_key: inst.instrument_key,
      symbol: inst.trading_symbol,
      name: inst.name,
      exchange: inst.exchange,
    }));

  return NextResponse.json({ results });
}
