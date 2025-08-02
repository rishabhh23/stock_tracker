// src/app/components/WatchlistTable.tsx
"use client";

import useWatchlist, { WatchRow } from "@/app/hooks/useWatchlist";

export default function WatchlistTable() {
  const { data: rows, mutate } = useWatchlist();

  async function deleteRow(id: string) {
    await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    mutate(); // re-validate the cache
  }

  if (!rows) return <p>Loading…</p>;

  return (
    <table className="mt-6 w-full border">
      <thead>
        <tr className="bg-gray-100 text-center">
          <th className="p-2">Symbol</th>
          <th className="p-2">Price</th>
          <th className="p-2">Prev&nbsp;Close</th>
          <th className="p-2" />
        </tr>
      </thead>
      <tbody>
        {rows.map((r: WatchRow) => (
          <tr key={r.id} className="text-center">
            <td className="p-2">{r.symbol}</td>
            <td className="p-2">
              {r.last_price != null ? `₹${r.last_price}` : "—"}
            </td>
            <td className="p-2">
              {r.prev_close != null ? `₹${r.prev_close}` : "—"}
            </td>
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
