import { NextResponse } from "next/server";

interface UpstoxNotifierPayload {
  access_token: string;
  expires_at?: number | string;
  message_type?: string;
}

function isUpstoxNotifierPayload(v: unknown): v is UpstoxNotifierPayload {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  const accessOk =
    typeof obj.access_token === "string" && obj.access_token.length > 0;
  const exp = obj.expires_at;
  const expOk =
    exp === undefined || typeof exp === "number" || typeof exp === "string";
  return accessOk && expOk;
}

async function upsertEnvVar(key: string, value: string): Promise<void> {
  const project = process.env.VERCEL_PROJECT_NAME!;
  const token = process.env.VERCEL_TOKEN!;
  const url = `https://api.vercel.com/v10/projects/${project}/env?upsert=true`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      value,
      type: "encrypted", // or "plain" if you prefer
      target: ["production"], // add "preview" if needed
    }),
  });

  if (!resp.ok) {
    const errTxt = await resp.text();
    throw new Error(`Vercel env upsert failed: ${errTxt}`);
  }
}

async function triggerDeployHook(): Promise<void> {
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL!;
  const resp = await fetch(hookUrl, { method: "POST" });
  if (!resp.ok) {
    const errTxt = await resp.text();
    throw new Error(`Deploy Hook failed: ${errTxt}`);
  }
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    // Not JSON or empty; ignore
    return NextResponse.json({ ok: true });
  }

  if (!isUpstoxNotifierPayload(json)) {
    // Ignore unrelated notifier events
    return NextResponse.json({ ok: true });
  }

  try {
    await upsertEnvVar("UPSTOX_ACCESS_TOKEN", json.access_token);
    await triggerDeployHook();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "internal";
    // eslint-disable-next-line no-console
    console.error(message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
