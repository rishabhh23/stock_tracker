import { NextRequest, NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";
import { fetchPriceData } from "@/app/lib/pricing";
import { getDailyCandlesV3 } from "@/app/lib/history";
import { WatchFields } from "@/app/types";

export const runtime = "nodejs";

type AirtableRec<T> = { id: string; fields: T };

export async function GET() {
  const records = (await table
    .select({})
    .firstPage()) as unknown as AirtableRec<WatchFields>[];

  const payload = records.map(({ id, fields }) => ({ id, ...fields }));
  return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      symbol: string;
      instrument_key: string;
      name: string;
    };

    const { actualPrice, prevClose } = await fetchPriceData(
      body.instrument_key
    );

    let pct5d: number | undefined;
    const bars = await getDailyCandlesV3(body.instrument_key, 30);
    if (bars.length >= 6) {
      const today = bars.at(-1)?.close;
      const fiveBack = bars.at(-6)?.close;
      if (
        typeof today === "number" &&
        typeof fiveBack === "number" &&
        today !== 0
      ) {
        pct5d = ((today - fiveBack) / today) * 100;
      }
    }

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
