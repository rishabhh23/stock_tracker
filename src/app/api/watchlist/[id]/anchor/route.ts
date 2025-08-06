import { NextRequest, NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { anchor_price } = await req.json();
  await table.update(id, { anchor_price });
  return NextResponse.json({ ok: true });
}
