"use client";

import { useCallback, useEffect, useState } from "react";
import {Link} from '@/i18n/navigation';
import { PLAUSIBLE_DOMAIN, CLARITY_ID } from "@/lib/config";
import {useTranslations} from 'next-intl';

const CONSENT_KEY = "cookie-consent";

type ConsentState = "undecided" | "accepted" | "declined";

function readConsent(): ConsentState {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "declined") return stored;
  } catch (err) {
    console.warn("CookieConsent: localStorage read failed: %s", err);
  }
  return "undecided";
}

function loadAnalyticsScripts(): void {
  if (typeof document === "undefined") return;

  // Plausible Analytics (self-hosted)
  if (PLAUSIBLE_DOMAIN) {
    const plausible = document.createElement("script");
    plausible.defer = true;
    plausible.dataset.domain = PLAUSIBLE_DOMAIN;
    plausible.src = "https://analytics.opendesk-edu.org/script.js";
    document.head.appendChild(plausible);
  }

  // Microsoft Clarity
  if (CLARITY_ID) {
    const clarity = document.createElement("script");
    clarity.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window,document,"clarity","script","${CLARITY_ID}");
    `;
    document.head.appendChild(clarity);
  }
}

export default function CookieConsent() {
  // Server renders hidden (null). Client hydrates consent from localStorage.
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const t = useTranslations('cookieConsent');

  useEffect(() => {
    const stored = readConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate hydration from localStorage
    setConsent(stored);
    if (stored === "accepted") {
      loadAnalyticsScripts();
    }
  }, []);

  const accept = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch (err) {
      console.warn("CookieConsent: localStorage set (accept) failed: %s", err);
    }
    loadAnalyticsScripts();
    setConsent("accepted");
  }, []);

  const decline = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_KEY, "declined");
    } catch (err) {
      console.warn("CookieConsent: localStorage set (decline) failed: %s", err);
    }
    setConsent("declined");
  }, []);

  // Not yet hydrated or already decided → don't show banner
  if (consent !== "undecided") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-4">
      <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-foreground-secondary">
          {t('message')}{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            {t('privacyLink')}
          </Link>
        </p>
        <div className="flex gap-3">
          <button
            onClick={decline}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background-secondary transition-colors"
          >
            {t('decline')}
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-button transition-colors"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
