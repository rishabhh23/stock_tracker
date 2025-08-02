import { NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";

export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  await table.destroy(id);
  return NextResponse.json({ ok: true });
}
