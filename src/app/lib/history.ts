export type Candle = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Fetch daily candles via Upstox v3:
 * GET /v3/historical-candle/{instrument_key}/days/1/{to_date}?from_date=YYYY-MM-DD
 * Returns oldest → newest Candle[]
 */
export async function getDailyCandlesV3(
  instrumentKey: string,
  daysBack = 30
): Promise<Candle[]> {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - daysBack);

  const url = `https://api.upstox.com/v3/historical-candle/${encodeURIComponent(
    instrumentKey
  )}/days/1/${ymd(to)}?from_date=${ymd(from)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Upstox v3 candles error", res.status, await res.text());
      return [];
    }

    const j = (await res.json()) as {
      data?: { candles?: Candle[] };
    };

    const raw = j?.data?.candles ?? [];
    const mapped: Candle[] = raw.map((c) =>
      Array.isArray(c)
        ? {
            // Upstox array format: [ts, open, high, low, close, volume, ...]
            timestamp: String(c[0]),
            open: Number(c[1]),
            high: Number(c[2]),
            low: Number(c[3]),
            close: Number(c[4]),
            volume: c[5] != null ? Number(c[5]) : undefined,
          }
        : (c as Candle)
    );

    // Ensure oldest → newest just in case
    mapped.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return mapped;
  } catch (e) {
    console.error("Upstox v3 candles fetch failed", e);
    return [];
  }
}
