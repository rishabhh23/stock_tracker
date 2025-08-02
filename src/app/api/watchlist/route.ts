import { NextRequest, NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";
import { fetchPriceData } from "@/app/lib/pricing";

/**
 * GET  → return all watch-list rows
 * POST → create a new row {symbol, instrument_key, name}
 */
export async function GET() {
  try {
    const records = await table.select({}).firstPage();
    const rows = records.map((r) => ({ id: r.id, ...r.fields }));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Airtable GET error", err);
    return new NextResponse("Watchlist fetch failed", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // { symbol, instrument_key, name }

    // 1.  Get live / prev prices (never throws)
    const { actualPrice, prevClose } = await fetchPriceData(
      body.instrument_key
    );

    // 2.  Insert into Airtable (plain field object, NOT { fields: … })
    const record = await table.create({
      symbol: body.symbol,
      instrument_key: body.instrument_key,
      name: body.name,
      last_price: actualPrice ?? undefined,
      prev_close: prevClose ?? undefined,
    });

    return NextResponse.json({ id: record.id });
  } catch (err) {
    console.error("POST /api/watchlist error", err);
    // Bubble a readable error message back to the client
    return new NextResponse((err as Error).message ?? "Watchlist add failed", {
      status: 500,
    });
  }
}
