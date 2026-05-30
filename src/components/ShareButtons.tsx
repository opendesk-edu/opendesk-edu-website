"use client";

import { useCallback } from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      // Could add toast notification but skip for now
    } catch {
      // Fallback
    }
  }, [url]);

  const buttons = [
    {
      label: "Copy Link",
      onClick: copyLink,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: "Matrix",
      href: `https://matrix.to/#/${encodedUrl}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M.77 0h22.46v24H.77V0zm2.15 2.15v19.7h1.88l.6-3.73h1.05l.6 3.73h6.92l.6-3.73h1.05l.6 3.73h1.88V2.15H19.4l-.47 2.7H16.8l-.47-2.7H7.67l-.47 2.7H4.57l-.47-2.7H2.92zm3.94 6.25h1.7l.55 4.57h.07l1.02-4.57h1.44l1.02 4.57h.07l.55-4.57h1.7l-1.24 6.73h-1.61l-.93-4.17h-.07l-.93 4.17H9.1l-1.24-6.73zm-1.82 6.73V9.56l1.12 2.33v.85l-1.12 2.39zm9.68 0l-1.12-2.39v-.85l1.12-2.33v5.57z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3">Share this article</h3>
      <div className="flex flex-wrap gap-2">
        {buttons.map((btn) =>
          btn.href ? (
            <a
              key={btn.label}
              href={btn.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors"
              aria-label={`Share on ${btn.label}`}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </a>
          ) : (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors cursor-pointer"
              aria-label={btn.label}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}