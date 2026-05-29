"use client";

import { useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface LanguageSwitcherProps {
  onLocaleChange?: () => void;
}

const localeLabels: Record<string, string> = {
  en: "EN",
  de: "DE",
  fr: "FR",
  zh: "ZH",
};

export default function LanguageSwitcher({ onLocaleChange }: LanguageSwitcherProps) {
  const router = useRouter();
  const rawPathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("header.languageSwitcher");

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLocaleName = localeLabels[currentLocale] ?? currentLocale.toUpperCase();

  const handleLocaleChange = (newLocale: string) => {
    const localePrefix = `/${currentLocale}`;
    const pathWithoutLocale = rawPathname.startsWith(localePrefix)
      ? rawPathname.slice(localePrefix.length) || "/"
      : rawPathname;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace(pathWithoutLocale as any, { locale: newLocale });
    setIsOpen(false);
    onLocaleChange?.();
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="text-sm text-foreground-secondary hover:text-foreground transition-colors rounded-lg hover:bg-background-secondary cursor-pointer p-2"
        aria-label={t("label")}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {currentLocaleName}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 ml-1 inline-block"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-24 bg-background border border-border rounded-lg shadow-lg z-50" role="listbox" aria-label={t("label")}>
          {routing.locales
            .filter((locale) => locale !== currentLocale)
            .map((locale) => (
              <button
                key={locale}
                role="option"
                aria-selected={false}
                onClick={() => handleLocaleChange(locale)}
                className="block w-full text-left text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors px-3 py-2 rounded-lg cursor-pointer"
              >
                {localeLabels[locale]}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
