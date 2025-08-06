"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import useWatchlist from "@/app/hooks/useWatchlist";
import useLivePrice from "@/app/hooks/useLivePrice";
import { WatchRow } from "../types";

function AnchorCell({ row }: { row: WatchRow }) {
  const [temp, setTemp] = useState<string | undefined>(undefined);

  const { mutate: revalidate } = useSWRConfig();

  async function save() {
    const val = Number(temp ?? row.anchor_price);
    if (!isFinite(val)) return;

    await fetch(`/api/watchlist/${row.id}/anchor`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anchor_price: val }),
    });

    revalidate("/api/watchlist");
  }

  return (
    <input
      className="w-24 border rounded px-1 text-center"
      placeholder="₹"
      defaultValue={row.anchor_price ?? ""}
      onChange={(e) => setTemp(e.target.value)}
      onBlur={save}
    />
  );
}

function LivePriceCell({ row }: { row: WatchRow }) {
  const { price, prevClose, isLoading } = useLivePrice(row.instrument_key!);
  const pct5d = row.change_5d ?? null;

  // Anchor % = (Price - Anchor) / Anchor *100
  const anchorPct =
    price != null && row.anchor_price
      ? ((price - row.anchor_price) / row.anchor_price) * 100
      : null;

  const color = (v: number | null) =>
    v == null ? "text-gray-500" : v >= 0 ? "text-green-600" : "text-red-600";

  return (
    <>
      {/* Prev Close */}
      <td className="p-2">
        {isLoading ? "…" : prevClose != null ? `₹${prevClose.toFixed(2)}` : "—"}
      </td>

      {/* Current Price */}
      <td className="p-2">
        {isLoading ? "…" : price != null ? `₹${price.toFixed(2)}` : "—"}
      </td>

      {/* % 5-Day */}
      <td className={`p-2 ${color(pct5d)}`}>
        {pct5d != null ? `${pct5d.toFixed(2)} %` : "—"}
      </td>

      {/* Anchor Price input */}
      <td className="p-2">
        <AnchorCell row={row} />
      </td>

      {/* % vs Anchor */}
      <td className={`p-2 ${color(anchorPct)}`}>
        {anchorPct != null ? `${anchorPct.toFixed(2)} %` : "—"}
      </td>
    </>
  );
}

export default function WatchlistTable() {
  const { data: rows, mutate } = useWatchlist();

  async function deleteRow(id: string) {
    await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    mutate();
  }

  if (!rows) return <p>Loading…</p>;

  return (
    <table className="mt-6 w-full border-2 rounded-lg border-gray-500">
      <thead className="border-b-2 ">
        <tr className="text-center text-lg font-semibold">
          <th className="p-2">Symbol</th>
          <th className="p-2">Prev&nbsp;Close</th>
          <th className="p-2">Current&nbsp;Price</th>
          <th className="p-2">%&nbsp;5-Day</th>
          <th className="p-2">Anchor&nbsp;Price</th>
          <th className="p-2">%&nbsp;vs&nbsp;Anchor</th>
          <th className="p-2" />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="text-center">
            <td className="p-2">{r.symbol}</td>
            <LivePriceCell row={r} />
            <td className="p-2">
              <button
                onClick={() => deleteRow(r.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
