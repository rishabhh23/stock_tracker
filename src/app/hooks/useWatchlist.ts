// src/app/hooks/useWatchlist.ts
import useSWR from "swr";

/** One row from the Airtable watch-list */
export interface WatchRow {
  id: string;
  symbol: string;
  last_price?: number;
  prev_close?: number;
  instrument_key?: string;
  name?: string;
  change_5d?: number;
}

const fetcher = (url: string): Promise<WatchRow[]> =>
  fetch(url).then((r) => r.json() as Promise<WatchRow[]>);

export default function useWatchlist() {
  return useSWR<WatchRow[]>("/api/watchlist", fetcher);
}
