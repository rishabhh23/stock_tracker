"use client";

import { useState } from "react";
import useSuggestions from "@/app/hooks/useSuggestions";
import { Instrument } from "@/app/types";

type Props = {
  onSelect: (i: Instrument) => void;
};

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { suggestions, isLoading, error } = useSuggestions(query);

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
      <label className="text-center text-slate-400 text-3xl font-semibold mb-3">
        Search&nbsp;Stock
      </label>

      <input
        value={query}
        onChange={(e) => {
          const val = e.target.value.toUpperCase();
          setQuery(val);
          setOpen(val.length > 0);
        }}
        onFocus={() => setOpen(query.length > 0)}
        className="w-full p-4 rounded-2xl border border-gray-300 focus:outline-none focus:ring"
        placeholder="Type ticker – e.g. INFY"
      />

      {open && (
        <div className="absolute z-10 w-full mt-30 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {isLoading && <div className="p-4 text-center">Loading...</div>}

          {error && (
            <div className="p-4 text-center text-red-500">
              Error loading suggestions
            </div>
          )}

          {!isLoading && !error && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">No matches</div>
          )}

          {!isLoading &&
            !error &&
            suggestions.map((s) => (
              <div
                key={s.instrument_key}
                onClick={() => {
                  onSelect(s);
                  setQuery(s.symbol);
                  setOpen(false);
                }}
                className="text-black px-4 py-3 cursor-pointer hover:bg-gray-100 flex justify-between"
              >
                <span className="font-medium">{s.symbol}</span>
                <span className="text-sm text-gray-500 ml-2">{s.name}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
