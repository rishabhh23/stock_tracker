import { NextRequest, NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await table.destroy(params.id);
  return NextResponse.json({ ok: true });
}
