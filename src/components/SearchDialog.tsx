"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSearchData } from "@/hooks/useSearchData";
import type { SearchEntry } from "@/app/api/search/route";

/* Href type matches the PostCard pattern */

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

const SECTION_ORDER = ["components", "architecture", "get-started", "blog"] as const;

function groupBySection(entries: SearchEntry[]): Map<string, SearchEntry[]> {
  const groups = new Map<string, SearchEntry[]>();
  for (const section of SECTION_ORDER) {
    const filtered = entries.filter((e) => e.section === section);
    if (filtered.length > 0) {
      groups.set(section, filtered);
    }
  }
  return groups;
}

function matchesQuery(entry: SearchEntry, query: string): boolean {
  const q = query.toLowerCase();
  return (
    entry.title.toLowerCase().includes(q) ||
    (entry.description?.toLowerCase().includes(q) ?? false) ||
    (entry.categories?.some((c) => c.toLowerCase().includes(q)) ?? false) ||
    (entry.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
  );
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const router = useRouter();
  const t = useTranslations("search");
  const { entries, loading } = useSearchData();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [animating, setAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Filtered and grouped results
  const results = useMemo(() => {
    if (!query.trim()) return groupBySection(entries);
    const filtered = entries.filter((e) => matchesQuery(e, query));
    return groupBySection(filtered);
  }, [entries, query]);

  // Flatten for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: { entry: SearchEntry; section: string }[] = [];
    for (const [section, items] of results) {
      for (const entry of items) {
        flat.push({ entry, section });
      }
    }
    return flat;
  }, [results]);

  const totalResults = flatResults.length;

  // Reset state when opening/closing dialog
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset search state on dialog open
      setQuery("");
      setActiveIndex(-1);
      setAnimating(true);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      setAnimating(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  const navigateTo = useCallback(
    (entry: SearchEntry) => {
      router.push(`/${entry.section}/${entry.slug}` as Parameters<typeof router.push>[0]);
      onClose();
    },
    [router, onClose]
  );

  // Keyboard navigation within results
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev < totalResults - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalResults - 1));
      } else if (e.key === "Enter" && activeIndex >= 0 && activeIndex < totalResults) {
        e.preventDefault();
        const item = flatResults[activeIndex];
        if (item) {
          navigateTo(item.entry);
        }
      }
    },
    [activeIndex, totalResults, flatResults, navigateTo]
  );

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0) {
      resultsEndRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!open) return null;

  const sectionLabel = (section: string): string => {
    const keyMap: Record<string, string> = {
      components: "groupLabels.components",
      architecture: "groupLabels.architecture",
      "get-started": "groupLabels.getStarted",
      blog: "groupLabels.blog",
    };
    return t(keyMap[section] ?? section);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-200 ${
          animating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`relative w-full max-w-xl mx-4 rounded-xl border border-border bg-background shadow-2xl transition-all duration-200 ${
          animating
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
        style={{
          maxHeight: "min(70vh, 560px)",
        }}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4">
          <SearchIcon className="w-5 h-5 text-foreground-secondary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent py-4 px-3 text-foreground placeholder:text-foreground-secondary outline-none text-base"
            placeholder={t("placeholder")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            aria-label={t("placeholder")}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-background-secondary px-2 py-1 text-xs text-foreground-secondary font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          className="overflow-y-auto px-2 py-2"
          style={{ maxHeight: "calc(min(70vh, 560px) - 65px)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12 text-foreground-secondary text-sm">
              <LoadingSpinner label={t("loading")} />
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-foreground-secondary text-sm">
              {t("noResults")}
            </div>
          ) : (
            <div role="listbox" aria-label="Search results">
              {Array.from(results.entries()).map(([section, items], groupIdx) => {
                const startIndex = flatResults.findIndex(
                  (f) => f.section === section
                );
                return (
                  <div key={section} className="mb-2">
                    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                      {sectionLabel(section)}
                    </div>
                    {items.map((entry, itemIdx) => {
                      const globalIdx = startIndex + itemIdx;
                      const isActive = globalIdx === activeIndex;
                      return (
                        <button
                          key={`${entry.section}-${entry.slug}`}
                          role="option"
                          aria-selected={isActive}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer flex items-start gap-3 ${
                            isActive
                              ? "bg-accent text-white"
                              : "hover:bg-background-secondary text-foreground"
                          }`}
                          onClick={() => navigateTo(entry)}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {entry.title}
                            </div>
                            {entry.description && (
                              <div
                                className={`text-xs mt-0.5 line-clamp-1 ${
                                  isActive
                                    ? "text-white/70"
                                    : "text-foreground-secondary"
                                }`}
                              >
                                {entry.description}
                              </div>
                            )}
                          </div>
                          {entry.categories && entry.categories.length > 0 && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                                isActive
                                  ? "bg-white/20 text-white/80"
                                  : "bg-background-secondary text-foreground-secondary"
                              }`}
                            >
                              {entry.categories[0]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {/* Scroll anchor for active item */}
                    {groupIdx === Array.from(results.entries()).length - 1 && (
                      <div ref={resultsEndRef} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}
