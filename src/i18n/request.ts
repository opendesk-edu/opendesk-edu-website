import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "../../messages/en.json";
import de from "../../messages/de.json";
import fr from "../../messages/fr.json";
import zh from "../../messages/zh.json";

// Statically imported so getRequestConfig can be SYNCHRONOUS. An async request
// config forces Next.js to render the whole [locale] tree dynamically, which in
// turn makes notFound() stream a soft-404 (HTTP 200) instead of a real 404.
// With a synchronous config + static imports the routes can be generated
// statically and dynamicParams=false answers unknown params with a true 404.
const messagesByLocale = { en, de, fr, zh } as const;

export default getRequestConfig(({ locale }) => {
  const resolved =
    locale && routing.locales.includes(locale as (typeof routing.locales)[number])
      ? locale
      : routing.defaultLocale;

  return {
    locale: resolved,
    messages: messagesByLocale[resolved as keyof typeof messagesByLocale],
  };
});
