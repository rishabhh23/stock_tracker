import useSWR from "swr";
import { WatchRow } from "../types";

const fetcher = (url: string): Promise<WatchRow[]> =>
  fetch(url).then((r) => r.json() as Promise<WatchRow[]>);

export default function useWatchlist() {
  return useSWR<WatchRow[]>("/api/watchlist", fetcher);
}
