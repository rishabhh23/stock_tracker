interface QuoteItem {
  last_price: number | null;
}

interface LiveQuoteResponse {
  data: QuoteItem[];
}

interface OhlcEntry {
  instrument_token: string;
  ohlc: { open: number; high: number; low: number; close: number };
}

interface OhlcResponse {
  data: Record<string, OhlcEntry>;
}

export async function fetchPriceData(
  instrumentKey: string
): Promise<{ actualPrice: number | null; prevClose: number | null }> {
  const onServer = typeof window === "undefined";

  /* ---------- 1) LIVE QUOTE ---------- */
  let actualPrice: number | null = null;

  if (onServer) {
    const url = `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${encodeURIComponent(
      instrumentKey
    )}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`,
      },
    });
    if (res.ok) {
      const json = (await res.json()) as LiveQuoteResponse;
      actualPrice = json.data?.[0]?.last_price ?? null;
    }
  } else {
    const json = (await fetch(
      `/api/quote/${encodeURIComponent(instrumentKey)}`
    ).then((r) => r.json())) as { price: number | null };
    actualPrice = json.price;
  }

  /* ---------- 2) PREV CLOSE FALLBACK ---------- */
  let prevClose: number | null = null;

  if (actualPrice == null) {
    if (onServer) {
      const url = `https://api.upstox.com/v2/market-quote/ohlc?instrument_key=${encodeURIComponent(
        instrumentKey
      )}&interval=1d`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.UPSTOX_ACCESS_TOKEN}`,
        },
      });
      if (res.ok) {
        const json = (await res.json()) as OhlcResponse;
        const entry = Object.values(json.data).find(
          (e) => e.instrument_token === instrumentKey
        );
        prevClose = entry?.ohlc.close ?? null;
      }
    } else {
      const json = (await fetch(
        `/api/ohlc?instrument_key=${encodeURIComponent(instrumentKey)}`
      ).then((r) => r.json())) as OhlcResponse;
      const entry = Object.values(json.data).find(
        (e) => e.instrument_token === instrumentKey
      );
      prevClose = entry?.ohlc.close ?? null;
    }
  }

  return { actualPrice, prevClose };
}
