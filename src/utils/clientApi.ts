export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { auth?: boolean }
): Promise<{ success: boolean; message: string; data: T }> {
  const auth = options?.auth ?? true;
  const headers = new Headers(options?.headers);
  headers.set("content-type", "application/json");

  if (auth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) headers.set("authorization", `Bearer ${token}`);
  }

  const res = await fetch(path, {
    ...options,
    headers,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok) {
    const msg = json?.message ?? "Request failed";
    throw new Error(msg);
  }

  return json;
}
