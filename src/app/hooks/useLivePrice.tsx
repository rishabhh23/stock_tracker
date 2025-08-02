import useSWR from "swr";
import { fetchPriceData } from "../lib/pricing";

interface PriceData {
  actualPrice: number | null;
  prevClose: number | null;
}

// async function fetchPriceData(instrumentKey: string): Promise<PriceData> {
//   // 1) Try live quote
//   const quoteRes = await fetch(
//     `/api/quote/${encodeURIComponent(instrumentKey)}`
//   );
//   if (!quoteRes.ok) throw new Error(`Quote fetch failed: ${quoteRes.status}`);
//   const { price } = (await quoteRes.json()) as { price: number | null };

//   let prevClose: number | null = null;

//   // 2) If market closed (price===null), fetch OHLC
//   if (price == null) {
//     const ohlcRes = await fetch(
//       `/api/ohlc?instrument_key=${encodeURIComponent(instrumentKey)}`
//     );
//     if (ohlcRes.ok) {
//       const ohlcJson = (await ohlcRes.json()) as {
//         status: string;
//         data: Record<
//           string,
//           {
//             ohlc: { open: number; high: number; low: number; close: number };
//             last_price: number;
//             instrument_token: string;
//           }
//         >;
//       };

//       // Find the entry whose `instrument_token` matches our key
//       const entries = Object.values(ohlcJson.data);
//       const match = entries.find((e) => e.instrument_token === instrumentKey);
//       prevClose = match?.ohlc.close ?? null;
//     }
//   }

//   return { actualPrice: price, prevClose };
// }

export default function useLivePrice(instrumentKey: string) {
  const { data, error, isLoading } = useSWR<PriceData>(
    instrumentKey || null,
    () => fetchPriceData(instrumentKey),
    { refreshInterval: 1000, revalidateOnFocus: false }
  );

  return {
    actualPrice: data?.actualPrice ?? null,
    prevClose: data?.prevClose ?? null,
    isLoading,
    error,
  };
}
