import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN! }).base(
  process.env.AIRTABLE_BASE!
);

export const table = base(process.env.AIRTABLE_TABLE!);
