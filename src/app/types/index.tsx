export interface Instrument {
  exchange: string;
  instrument_key: string;
  symbol: string;
  name: string;
}

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchFields {
  symbol: string;
  instrument_key: string;
  name: string;
  last_price?: number;
  prev_close?: number;
  change_5d?: number;
}
