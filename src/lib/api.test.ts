import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  ApiError,
  isProxyBase,
  defaultApiBase,
  getApiBase,
  setApiBase,
  screenerQuery,
  api,
} from "./api";

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("isProxyBase", () => {
  it("treats a relative path as the proxy", () => {
    expect(isProxyBase("/backend")).toBe(true);
  });
  it("treats an absolute URL as a direct backend", () => {
    expect(isProxyBase("https://api.example.com")).toBe(false);
    expect(isProxyBase("http://localhost:8000")).toBe(false);
  });
});

describe("defaultApiBase", () => {
  it("falls back to the built-in proxy when no env override is set", () => {
    expect(defaultApiBase()).toBe("/backend");
  });
});

describe("getApiBase / setApiBase — localStorage override", () => {
  it("returns the default when nothing is stored", () => {
    expect(getApiBase()).toBe("/backend");
  });
  it("persists an override and strips trailing slashes", () => {
    setApiBase("https://api.example.com/");
    expect(getApiBase()).toBe("https://api.example.com");
  });
  it("clears the override when set to blank (back to proxy)", () => {
    setApiBase("https://api.example.com");
    setApiBase("");
    expect(getApiBase()).toBe("/backend");
  });
});

describe("screenerQuery — querystring construction", () => {
  it("always includes profile/adaptive/use_ml/limit with a default limit", () => {
    const q = screenerQuery({ profile: "Balanced", adaptive: true, use_ml: true });
    expect(q).toBe("/screener?profile=Balanced&adaptive=true&use_ml=true&limit=500");
  });
  it("omits falsy optional filters and includes the provided ones", () => {
    const q = screenerQuery({
      profile: "Aggressive",
      adaptive: false,
      use_ml: false,
      sector: "Technology",
      signal: "BUY",
      min_score: 70,
      search: "nvda",
      limit: 50,
    });
    const params = new URLSearchParams(q.split("?")[1]);
    expect(params.get("profile")).toBe("Aggressive");
    expect(params.get("adaptive")).toBe("false");
    expect(params.get("sector")).toBe("Technology");
    expect(params.get("signal")).toBe("BUY");
    expect(params.get("min_score")).toBe("70");
    expect(params.get("search")).toBe("nvda");
    expect(params.get("limit")).toBe("50");
  });
  it("drops min_score when zero (default, no filter)", () => {
    const q = screenerQuery({ profile: "Balanced", adaptive: true, use_ml: true, min_score: 0 });
    expect(q).not.toContain("min_score");
  });
});

describe("api client — request joins base + path and maps failures to ApiError", () => {
  it("GET hits the resolved base + path", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: 1 }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await api.get("/health");
    expect(fetchMock).toHaveBeenCalledWith("/backend/health", expect.objectContaining({
      headers: expect.objectContaining({ "Content-Type": "application/json" }),
    }));
  });

  it("uses the localStorage override as the base when set", async () => {
    setApiBase("https://api.example.com");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);
    await api.get("/dashboard");
    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/dashboard", expect.anything());
  });

  it("surfaces the backend's detail message on a non-2xx response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      json: async () => ({ detail: "No snapshot yet." }),
    }));
    await expect(api.get("/dashboard")).rejects.toMatchObject({
      message: "No snapshot yet.",
      status: 503,
    });
  });

  it("maps a network failure to ApiError with status 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const err = await api.get("/dashboard").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
  });
});
