import { NextRequest, NextResponse } from "next/server";
import { gunzip } from "zlib";
import { promisify } from "util";

const gunzipAsync = promisify(gunzip);
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const query = (req.nextUrl.searchParams.get("query") || "").toLowerCase();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const url =
    "https://assets.upstox.com/market-quote/instruments/exchange/complete.json.gz";

  const res = await fetch(url, {
    cache: "force-cache",
    headers: {
      "User-Agent": "Mozilla/5.0 (Compatible; Upstox API Client)",
    },
  });
  if (!res.ok) {
    return new NextResponse("Failed to fetch instruments", {
      status: res.status,
    });
  }

  const buf = await res.arrayBuffer();
  const jsonBuf = await gunzipAsync(Buffer.from(buf));
  const all = JSON.parse(jsonBuf.toString("utf8")) as Array<{
    trading_symbol: string;
    instrument_key: string;
    name: string;
    exchange: string;
    instrument_type: string;
  }>;

  const results = all
    .filter(
      (inst) =>
        inst.trading_symbol.toLowerCase().includes(query) &&
        inst.instrument_type === "EQ"
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
