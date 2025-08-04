import useSWR from "swr";
import { fetchPriceData } from "../lib/pricing";

interface PriceData {
  actualPrice: number | null;
  prevClose: number | null;
}

export default function useLivePrice(instrumentKey: string) {
  const { data, error, isLoading } = useSWR<PriceData>(
    instrumentKey || null,
    () => fetchPriceData(instrumentKey),
    {
      refreshInterval: 300000,
      revalidateOnFocus: false,
    }
  );

  return {
    price: data?.actualPrice ?? null,
    prevClose: data?.prevClose ?? null,
    isLoading,
    error,
  };
}
