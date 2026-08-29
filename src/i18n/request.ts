import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "../../messages/en.json";
import de from "../../messages/de.json";
import fr from "../../messages/fr.json";
import zh from "../../messages/zh.json";

// Statically imported messages keep the config fast.  When setRequestLocale
// has been called (in [locale]/layout.tsx), `requestLocale` resolves
// synchronously from React's cache — no I/O, so static rendering is
// preserved.  Without middleware the `locale` param is always undefined;
// `requestLocale` is the only reliable source.
const messagesByLocale = { en, de, fr, zh } as const;

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const effective = locale ?? (await requestLocale) ?? routing.defaultLocale;
  const resolved =
    routing.locales.includes(effective as (typeof routing.locales)[number])
      ? effective
      : routing.defaultLocale;

  return {
    locale: resolved,
    messages: messagesByLocale[resolved as keyof typeof messagesByLocale],
  };
});
