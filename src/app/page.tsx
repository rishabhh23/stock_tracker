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
    setErrorMsg(null);
    setAdding(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(i),
      });

      if (!res.ok) {
        const text = await res.text(); // <- read server error
        throw new Error(text || "Add failed");
      }

      await mutate(); // refresh table
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="min-h-screen rounded-lg bg-[linear-gradient(90deg,_#0F141B_0%,_#182029_20%,_#243240_45%,_#354554_70%,_#485462_100%)] p-4 flex flex-col items-center text-slate-200 text-2xl">
      <h1 className="text-4xl font-extrabold mt-10 mb-6 text-center">
        Live&nbsp;Price&nbsp;Tracker
      </h1>

      <SearchBar onSelect={handleSelect} />
      {adding && (
        <p className="mt-2 text-sm text-gray-500 animate-pulse">Adding…</p>
      )}
      {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}

      <WatchlistTable />
    </main>
  );
}
