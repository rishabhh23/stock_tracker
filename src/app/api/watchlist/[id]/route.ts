import { NextRequest, NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await table.destroy(id);
  return NextResponse.json({ ok: true });
}
