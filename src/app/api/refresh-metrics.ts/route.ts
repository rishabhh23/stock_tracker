import { NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";
import { getDailyCandles } from "@/app/lib/history";

export const runtime = "nodejs";

export async function GET() {
  const records = await table.select({}).all();

  for (const rec of records) {
    const key = rec.get("instrument_key") as string | undefined;
    if (!key) continue;

    const candles = await getDailyCandles(key, 6); // today + 5 back
    if (candles.length < 6) continue;

    const pct5d =
      ((candles.at(-1)!.close - candles.at(0)!.close) / candles.at(0)!.close) *
      100;

    await table.update(rec.id, { change_5d: pct5d });
  }

  return NextResponse.json({ ok: true });
}
