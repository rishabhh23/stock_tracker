"use client";

import React from "react";
import useLivePrice from "@/app/hooks/useLivePrice";
import { Instrument } from "@/app/types";

type Props = { instrument: Instrument };

export default function PriceTile({ instrument }: Props) {
  const { price, prevClose, isLoading, error } = useLivePrice(
    instrument.instrument_key
  );

  let display: string;
  if (isLoading) {
    display = "Loading…";
  } else if (error) {
    display = "Error";
  } else if (price != null) {
    display = `₹${price.toFixed(2)}`;
  } else if (prevClose != null) {
    display = `₹${prevClose.toFixed(2)} (Prev Close)`;
  } else {
    display = "N/A";
  }

  return (
    <div className="p-4 bg-white border rounded-xl shadow">
      <h2 className="text-xl font-bold mb-1">{instrument.symbol}</h2>
      <p className="text-4xl font-mono">{display}</p>
    </div>
  );
}
