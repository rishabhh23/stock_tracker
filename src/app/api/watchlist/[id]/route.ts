import { NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  context: { params: Record<string, string> }
) {
  // satisfy the lint rule (await something before reading .id)
  const { id } = await Promise.resolve(context.params);

  await table.destroy(id);

  return NextResponse.json({ ok: true });
}
