"use client";
import { useState } from "react";
import SearchBar from "./SearchBar";
import PriceTile from "./PriceTile";
import { Instrument } from "../../types";

export default function TickerSearch() {
  const [selected, setSelected] = useState<Instrument | null>(null);

  return (
    <div className="w-full max-w-xl">
      <SearchBar onSelect={setSelected} />
      {selected && <PriceTile instrument={selected} />}
    </div>
  );
}
