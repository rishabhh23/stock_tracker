import { NextRequest, NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";
import { fetchPriceData } from "@/app/lib/pricing";
import { getDailyCandlesV3 } from "@/app/lib/history";

export const runtime = "nodejs";

type WatchFields = {
  symbol: string;
  instrument_key: string;
  name: string;
  last_price?: number;
  prev_close?: number;
  change_5d?: number;
};

type AirtableRec<T> = { id: string; fields: T };

export async function GET() {
  const records = (await table
    .select({})
    .firstPage()) as unknown as AirtableRec<WatchFields>[];

  const payload = records.map((r) => ({ id: r.id, ...r.fields }));
  return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      symbol: string;
      instrument_key: string;
      name: string;
    };

    // 1) Live price + previous close
    const { actualPrice, prevClose } = await fetchPriceData(
      body.instrument_key
    );

    // 2) Use Upstox v3 to fetch enough days to survive weekends/holidays
    //    We take the most recent trading day and the one 5 trading sessions earlier
    let pct5d: number | undefined = undefined;
    const bars = await getDailyCandlesV3(body.instrument_key, 30); // oldest → newest

    if (bars.length >= 6) {
      const today = bars[bars.length - 1]?.close;
      const fiveBack = bars[bars.length - 6]?.close;
      if (
        typeof today === "number" &&
        typeof fiveBack === "number" &&
        today !== 0
      ) {
        // Your requested denominator: today's close
        pct5d = ((today - fiveBack) / today) * 100;
        // If you prefer the conventional base, use: ((today - fiveBack) / fiveBack) * 100;
      }
    }

    // 3) Insert into Airtable (use undefined instead of null)
    await table.create([
      {
        fields: {
          symbol: body.symbol,
          instrument_key: body.instrument_key,
          name: body.name,
          last_price: actualPrice ?? undefined,
          prev_close: prevClose ?? undefined,
          change_5d: pct5d,
        } as Partial<WatchFields>,
      },
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Add failed:", err);
    return new NextResponse("Add failed", { status: 500 });
  }
}
