"use client";

import { useState } from "react";
import SearchBar from "@/app/components/TickerSearch/SearchBar";
import WatchlistTable from "@/app/components/WatchlistTable";
import useWatchlist from "@/app/hooks/useWatchlist";
import { Instrument } from "@/app/types";

export default function Home() {
  const { mutate } = useWatchlist();
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSelect(i: Instrument) {
    try {
      setErrorMsg(null);
      setAdding(true);
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(i),
      });
      if (!res.ok) throw new Error((await res.text()) || "Add failed");
      await mutate();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-growwBg text-black px-4 sm:px-8 lg:px-10 py-8">
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mt-6 mb-10 text-center leading-tight tracking-wide">
        Live&nbsp;Price&nbsp;Tracker
      </h1>

      <div className="w-full max-w-3xl items-center">
        <SearchBar onSelect={handleSelect} />
      </div>

      {adding && (
        <p className="mt-4 text-xl sm:text-2xl text-gray-300 animate-pulse">
          Adding…
        </p>
      )}
      {errorMsg && (
        <p className="mt-4 text-xl sm:text-2xl text-red-400">{errorMsg}</p>
      )}

      <div className="w-full rounded-lg max-w-7xl mt-12 overflow-x-auto text-xl sm:text-2xl">
        <WatchlistTable />
      </div>
    </main>
  );
}
