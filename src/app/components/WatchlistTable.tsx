"use client";

import useWatchlist, { WatchRow } from "@/app/hooks/useWatchlist";
import useLivePrice from "@/app/hooks/useLivePrice";

function LivePriceCell({ row }: { row: WatchRow }) {
  const { price, prevClose, isLoading } = useLivePrice(row.instrument_key!);

  return (
    <>
      <td className="p-2">
        {isLoading ? "…" : price != null ? `₹${price.toFixed(2)}` : "—"}
      </td>
      <td className="p-2">
        {isLoading ? "…" : prevClose != null ? `₹${prevClose.toFixed(2)}` : "—"}
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
          <th className="p-2">Current Price</th>
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
