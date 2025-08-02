import useSWR from "swr";
import { Instrument } from "@/app/types";

export interface SearchResponse {
  results: Instrument[];
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Network error");
    return res.json() as Promise<SearchResponse>;
  });

export default function useSuggestions(query: string) {
  // only hit the API when there's something to search
  const shouldFetch = query.length > 0;
  const { data, error, isLoading } = useSWR<SearchResponse>(
    shouldFetch ? `/api/search?query=${encodeURIComponent(query)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // ALWAYS an array
  const suggestions: Instrument[] = data?.results ?? [];
  return { suggestions, error, isLoading };
}
