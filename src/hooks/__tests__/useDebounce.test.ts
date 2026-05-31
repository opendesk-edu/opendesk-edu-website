import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 200));
    expect(result.current).toBe("hello");
  });

  it("does not update before the delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 200 } }
    );

    act(() => {
      rerender({ value: "world", delay: 200 });
    });

    expect(result.current).toBe("hello");
  });

  it("updates after the delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "hello", delay: 200 } }
    );

    act(() => {
      rerender({ value: "world", delay: 200 });
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("world");
  });

  it("uses default delay of 200ms", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "a" } }
    );

    act(() => {
      rerender({ value: "b" });
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("b");
  });

  it("cancels previous timer on new value", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "a", delay: 500 } }
    );

    act(() => {
      rerender({ value: "b", delay: 500 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("a");

    act(() => {
      rerender({ value: "c", delay: 500 });
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("c");
  });
});
