"use client";

import { useState, useEffect } from "react";
import { useSWRConfig } from "swr";
import useWatchlist from "@/app/hooks/useWatchlist";
import useLivePrice from "@/app/hooks/useLivePrice";
import { WatchRow } from "../types";

const color = (v: number | null) =>
  v == null ? "text-gray-500" : v >= 0 ? "text-green-600" : "text-red-600";

function WatchlistRow({
  row,
  onDelete,
}: {
  row: WatchRow;
  onDelete: (id: string) => void;
}) {
  const { price, prevClose, isLoading } = useLivePrice(row.instrument_key!);
  const { mutate: revalidate } = useSWRConfig();
  const [anchor, setAnchor] = useState<number | null>(null);

  useEffect(() => {
    if (price != null) setAnchor(price);
  }, [price]);

  async function saveAnchor() {
    if (anchor == null || !isFinite(anchor)) return;
    await fetch(`/api/watchlist/${row.id}/anchor`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anchor_price: anchor }),
    });
    revalidate("/api/watchlist");
  }

  const effectivePrice = price ?? prevClose ?? null;

  const pctChange =
    anchor != null && effectivePrice != null
      ? ((effectivePrice - anchor) / anchor) * 100
      : null;

  const pct5d: number | null = row.change_5d ?? null;

  return (
    <tr className="text-center">
      <td className="p-2">{row.symbol}</td>

      <td className="p-2">
        {isLoading ? "…" : prevClose != null ? `₹${prevClose.toFixed(2)}` : "—"}
      </td>

      <td className="p-2">
        {isLoading ? "…" : price != null ? `₹${price.toFixed(2)}` : "—"}
      </td>

      <td className={`p-2 ${color(pct5d)}`}>
        {pct5d != null ? `${pct5d.toFixed(2)} %` : "—"}
      </td>

      <td className="p-2">
        <input
          className="w-24 border rounded px-1 text-center"
          placeholder="₹"
          value={anchor ?? ""}
          onChange={(e) => {
            const v = Number(e.target.value);
            setAnchor(isFinite(v) ? v : null);
          }}
          onBlur={saveAnchor}
          onKeyDown={(e) => e.key === "Enter" && saveAnchor()}
        />
      </td>

      <td className={`p-2 ${color(pctChange)}`}>
        {pctChange != null ? `${pctChange.toFixed(2)} %` : "—"}
      </td>

      <td className="p-2">
        <button
          onClick={() => onDelete(row.id)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </td>
    </tr>
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
      <thead className="border-b-2">
        <tr className="text-center text-lg font-semibold">
          <th className="p-2">Symbol</th>
          <th className="p-2">Prev&nbsp;Close</th>
          <th className="p-2">Current&nbsp;Price</th>
          <th className="p-2">%&nbsp;5-Day</th>
          <th className="p-2">Anchor&nbsp;Price</th>
          <th className="p-2">%&nbsp;Change</th>
          <th className="p-2" />
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <WatchlistRow key={r.id} row={r} onDelete={deleteRow} />
        ))}
      </tbody>
    </table>
  );
}
