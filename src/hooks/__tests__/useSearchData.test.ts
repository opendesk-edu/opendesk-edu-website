import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSearchData } from "@/hooks/useSearchData";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("useSearchData", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("starts with loading=true", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    const { result } = renderHook(() => useSearchData());
    expect(result.current.loading).toBe(true);
    expect(result.current.entries).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches entries on mount with correct locale", async () => {
    const entries = [{ title: "Jitsi", slug: "jitsi", section: "components" }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => entries,
    });
    const { result } = renderHook(() => useSearchData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockFetch).toHaveBeenCalledWith("/api/search?locale=en");
    expect(result.current.entries).toEqual(entries);
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useSearchData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Network error");
    expect(result.current.entries).toEqual([]);
  });

  it("sets error when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    const { result } = renderHook(() => useSearchData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch search data");
  });

  it("refetch re-fetches data", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ title: "Initial" }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ title: "Refetched" }],
      });
    const { result } = renderHook(() => useSearchData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    result.current.refetch();
    await waitFor(() => {
      expect(result.current.entries).toEqual([{ title: "Refetched" }]);
    });
  });

  it("handles unknown error type", async () => {
    mockFetch.mockRejectedValueOnce("string error");
    const { result } = renderHook(() => useSearchData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Unknown error");
  });
});
