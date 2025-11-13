import { http } from "./http";

export type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
};

export async function authFetch<T = any>(input: string, init?: FetchOptions): Promise<T> {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  const isAbs = /^https?:\/\//i.test(input);
  const path = input.startsWith("/") ? input : `/${input}`;
  const url = isAbs ? input : `${base}${path}`;
  try {
    const method = (init?.method ?? "GET").toLowerCase();
    const config: any = { url, method, headers: init?.headers };
    if (init?.body !== undefined) {
      if (typeof init.body === "string") {
        try {
          config.data = JSON.parse(init.body);
        } catch {
          config.data = init.body;
        }
      } else {
        config.data = init.body;
      }
    }
    const response = await http.request<T>(config);
    return response.data as T;
  } catch (err: any) {
    const status = err?.response?.status;
    const body = err?.response?.data ?? err?.message;
    const e: any = new Error(body?.message ?? body ?? err?.message ?? "HTTP error");
    e.status = status;
    e.body = body;
    throw e;
  }
}
