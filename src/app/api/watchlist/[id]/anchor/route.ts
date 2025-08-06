import { NextResponse } from "next/server";
import { table } from "@/app/lib/airtable";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { anchor_price } = (await request.json()) as { anchor_price: number };

    const { id } = await Promise.resolve(context.params);

    await table.update(id, { anchor_price });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("anchor_price update failed", e);
    return new NextResponse("Failed", { status: 500 });
  }
}
