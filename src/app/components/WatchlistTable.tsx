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

  const [anchor, setAnchor] = useState<number | null>(row.anchor_price ?? null);

  async function persist(val: number) {
    await fetch(`/api/watchlist/${row.id}/anchor`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anchor_price: val }),
    });
    revalidate("/api/watchlist");
  }

  useEffect(() => {
    if (price != null && price !== anchor) {
      setAnchor(price);
      persist(price);
    }
  }, [price]);

  async function saveAnchor() {
    if (anchor != null && isFinite(anchor)) await persist(anchor);
  }

  const effectivePrice = price ?? prevClose ?? null;
  const pctChange =
    anchor != null && anchor !== 0 && effectivePrice != null
      ? ((effectivePrice - anchor) / anchor) * 100
      : null;
  const pct5d: number | null = row.change_5d ?? null;
  const cell = "py-4 px-6 first:rounded-l-2xl last:rounded-r-2xl";

  return (
    <tr className="text-center hover:bg-gray-100">
      <td className={cell}>{row.symbol}</td>

      <td className={cell}>
        {isLoading ? "…" : prevClose != null ? `₹${prevClose.toFixed(2)}` : "—"}
      </td>

      {/* <td className={cell}>
        {isLoading ? "…" : price != null ? `₹${price.toFixed(2)}` : "—"}
      </td> */}

      <td className={`${cell} ${color(pct5d)}`}>
        {pct5d != null ? `${pct5d.toFixed(2)} %` : "—"}
      </td>

      <td className={cell}>
        <input
          className="w-24 border rounded px-2 text-center"
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

      <td className={`${cell} ${color(pctChange)}`}>
        {pctChange != null ? `${pctChange.toFixed(2)} %` : "—"}
      </td>

      <td className={cell}>
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
    <table className="w-full border-b-2 border-gray-200">
      <thead className="border-b-2 border-gray-200">
        <tr className="text-center text-lg font-semibold">
          <th className="p-2">Symbol</th>
          {/* <th className="p-2">Prev&nbsp;Close</th> */}
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
