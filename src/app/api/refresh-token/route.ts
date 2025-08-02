import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { kv } from "@vercel/kv";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await axios.post(
      "https://api.upstox.com/v2/login/refresh_token",
      {
        client_id: process.env.UPSTOX_CLIENT_ID,
        client_secret: process.env.UPSTOX_CLIENT_SECRET,
        refresh_token: process.env.UPSTOX_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }
    );

    await kv.set("upstox_access_token", data.access_token);
    return NextResponse.json({
      ok: true,
      refreshedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const apiErr = err as AxiosError;
      console.error(
        "Upstox refresh failed:",
        apiErr.response?.data ?? apiErr.message
      );
    } else {
      console.error("Unexpected error:", err);
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
