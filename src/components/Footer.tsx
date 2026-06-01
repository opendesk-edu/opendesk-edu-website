"use client";

import { useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import EmailLink from "@/components/EmailLink";
import ContactForm from "@/components/ContactForm";
import { useTranslations, useLocale } from "next-intl";

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}

export default function Footer() {
  const t = useTranslations("footer");
  const tSub = useTranslations("subscribe");
  const tCf = useTranslations("contactForm");
  const locale = useLocale();

  const [showContactForm, setShowContactForm] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleNewsletterSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (newsletterState === "submitting" || !newsletterEmail.trim()) return;

      setNewsletterState("submitting");
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newsletterEmail.trim() }),
        });

        if (!res.ok) throw new Error();
        setNewsletterState("success");
        setNewsletterEmail("");
      } catch {
        setNewsletterState("error");
      }
    },
    [newsletterEmail, newsletterState]
  );

  return (
    <footer className="border-t border-border bg-background-secondary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-3 pb-6 mb-6 border-b border-border">
          <p className="text-sm font-medium text-foreground">
            {tSub("heading")}
          </p>
          <p className="text-xs text-foreground-secondary text-center max-w-md">
            {tSub("description")}
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex items-center gap-2 mt-1 w-full max-w-xs"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={tSub("newsletterPlaceholder")}
              required
              disabled={newsletterState === "submitting"}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
              aria-label={tSub("newsletterPlaceholder")}
            />
            <button
              type="submit"
              disabled={newsletterState === "submitting"}
              className="px-3 py-1.5 bg-foreground text-background rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
            >
              {newsletterState === "submitting"
                ? "..."
                : tSub("newsletterButton")}
            </button>
          </form>
          {newsletterState === "success" && (
            <p className="text-xs text-green-600">{tSub("newsletterSuccess")}</p>
          )}
          {newsletterState === "error" && (
            <p className="text-xs text-red-500">{tSub("newsletterError")}</p>
          )}

          <div className="flex items-center gap-6 mt-1">
            <a
              href={`/${locale}/rss`}
              className="flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors"
              aria-label={tSub("rss")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93v-2.83Z" />
              </svg>
              <span>{tSub("rss")}</span>
            </a>
            <button
              onClick={() => setShowContactForm(true)}
              className="flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
              aria-label={tSub("contact")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4l-10 8L2 4" />
              </svg>
              <span>{tSub("contact")}</span>
            </button>
            <a
              href="https://matrix.to/#/#opendesk-ce-public:matrix.uni-marburg.de"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors"
              aria-label="Matrix"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M2 2v20h20V2H2zm17.7 17.7h-3.4v-6.5c0-1.5-.6-2.4-1.8-2.4-1.3 0-2 .9-2 2.4v6.5H8.7V8.7h3.4v1.7c.5-.9 1.7-1.9 3.4-1.9 2 0 3.5 1.3 3.5 4.1v7.1z" />
              </svg>
              <span>Matrix</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href="/imprint"
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              {t("imprint")}
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              {t("privacy")}
            </Link>
            <EmailLink className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
              {t("contact")}
            </EmailLink>
            <span className="text-border">|</span>
            <ExternalLink
              href="https://codeberg.org/opendesk-edu/opendesk-edu-website"
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              {t("sourceCode")}
            </ExternalLink>
            <span className="text-border">|</span>
            <a
              href={`/${locale}/rss`}
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors flex items-center gap-1"
              aria-label={t("rss")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93v-2.83Z" />
              </svg>
              <span>{t("rss")}</span>
            </a>
          </div>
          <p className="text-xs text-foreground-secondary">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>

      {showContactForm && (
        <ContactForm
          onClose={() => setShowContactForm(false)}
          t={(key: string) => tCf(key)}
        />
      )}
    </footer>
  );
}
