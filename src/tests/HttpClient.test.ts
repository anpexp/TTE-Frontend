import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axios, { type AxiosInstance } from "axios";
import { HttpClient } from "@/components/lib/HttpClient";
import { mockBrowserStorage } from "../../tests/test-utils";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("HttpClient", () => {
  let axiosInstance: AxiosInstance;
  let restore: () => void;

  beforeEach(() => {
    const browser = mockBrowserStorage();
    restore = browser.restore;

    vi.resetModules();
    (HttpClient as unknown as { _instance: any })._instance = null;
    process.env.NEXT_PUBLIC_API_URL = "https://localhost:7101/api";

    axiosInstance = {
      defaults: {
        baseURL: "https://localhost:7101/api",
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      },
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    } as unknown as AxiosInstance;

    mockedAxios.create.mockReturnValue(axiosInstance);
  });

  afterEach(() => {
    restore();
  });

  it("creates a singleton axios instance with the configured base URL", () => {
    const first = HttpClient.instance;
    const second = HttpClient.instance;

    expect(mockedAxios.create).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect(first.defaults.baseURL).toBe("https://localhost:7101/api");
  });

  it("strips trailing slashes from the API root", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://localhost:7101/api/";
    (HttpClient as unknown as { _instance: any })._instance = null;

    HttpClient.instance;

    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: "https://localhost:7101/api" })
    );
  });
});