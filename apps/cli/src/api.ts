import { readFile } from "fs/promises";
import { resolve } from "path";

let baseUrl = process.env.EAM_API_URL ?? "http://localhost:3001";

export function setBaseUrl(url: string) {
  baseUrl = url.replace(/\/$/, "");
}

export async function loadSession(role?: string): Promise<{ agentId: string; projectId: string; role: string; backendUrl: string } | null> {
  // If role given, try that slug; otherwise look for any session
  const tryLoad = async (slug: string) => {
    try {
      const raw = await readFile(resolve(`.agents/${slug}/session.json`), "utf-8");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  if (role) {
    const slug = role.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return tryLoad(slug);
  }

  // Try to find any session
  try {
    const { readdir } = await import("fs/promises");
    const dirs = await readdir(resolve(".agents"));
    for (const dir of dirs) {
      const s = await tryLoad(dir);
      if (s) return s;
    }
  } catch { }

  return null;
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  // Auto-load session to set backendUrl if available
  const session = await loadSession();
  const effectiveBase = session?.backendUrl ?? baseUrl;
  const apiBase = effectiveBase.includes("/api") ? effectiveBase : `${effectiveBase}/api`;

  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export const get = <T>(path: string) => api<T>(path);

export const post = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });

export const patch = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "PATCH", body: JSON.stringify(body) });

export const del = <T>(path: string) => api<T>(path, { method: "DELETE" });
