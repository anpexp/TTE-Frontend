// src/components/lib/HttpClient.ts
import axios, { AxiosHeaders, CanceledError, type AxiosInstance } from "axios";

export class HttpClient {
  private static _instance: HttpClient | null = null;
  private client: AxiosInstance;

  private constructor() {
    const rawBase = (process.env.NEXT_PUBLIC_API_URL as string) || "";
    const base = rawBase.replace(/\/+$/, "") || undefined;

    this.client = axios.create({
      baseURL: base,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      timeout: 10000,
      withCredentials: true,
    });

    this.client.interceptors.request.use((config) => {
      const url = `${config.baseURL || ""}${config.url || ""}`;
      const isAuth = /\/api\/(?:Auth\/)?(login|register)/i.test(url);
      const onLogin = typeof window !== "undefined" && /^\/login(?:\/|$)/i.test(window.location.pathname);

      if (!config.headers) config.headers = new AxiosHeaders();

      if (isAuth || onLogin) {
        (config.headers as AxiosHeaders).delete("Authorization");
        if (onLogin && /\/api\/Cart(\/|$)/i.test(url)) {
          return Promise.reject(new CanceledError("blocked on /login"));
        }
        return config;
      }

      try {
        const t =
          localStorage.getItem("jwt_token") ||
          sessionStorage.getItem("jwt_token") ||
          localStorage.getItem("tte_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("access_token") ||
          "";
        const v = t ? (t.startsWith("Bearer ") ? t : `Bearer ${t}`) : "";
        if (v) (config.headers as AxiosHeaders).set("Authorization", v);
        else (config.headers as AxiosHeaders).delete("Authorization");
      } catch {}

      return config;
    });

    this.client.interceptors.response.use((r) => r, (e) => Promise.reject(e));
  }

  static get instance(): AxiosInstance {
    if (!HttpClient._instance) HttpClient._instance = new HttpClient();
    return HttpClient._instance.client;
  }
}
