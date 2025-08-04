import { NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await table.destroy(id);

  return NextResponse.json({ ok: true });
}
