const BASE = "https://api.upstox.com/v2";

export async function upstox(path: string, init: RequestInit = {}) {
  const token = process.env.UPSTOX_ACCESS_TOKEN!;
  return fetch(`${BASE}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}
