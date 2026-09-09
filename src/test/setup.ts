import "@testing-library/jest-dom";

// jsdom 29 no longer wires a storage backend into the environment (window
// .localStorage is undefined unless Node's experimental webstorage is
// enabled via --localstorage-file), so ThemeProvider / CookieConsent blow
// up on first access. Install a minimal Map-backed implementation.
function createStorageMock(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => void store.delete(key),
    setItem: (key: string, value: string) => void store.set(key, String(value)),
  };
}

for (const target of [globalThis, window]) {
  if (typeof (target as { localStorage?: unknown }).localStorage === "undefined") {
    Object.defineProperty(target, "localStorage", {
      value: createStorageMock(),
      configurable: true,
      writable: true,
    });
  }
}

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class MockIntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds = [];
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;
