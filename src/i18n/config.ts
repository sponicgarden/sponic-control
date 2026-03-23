export const i18n = {
  defaultLocale: "en",
  locales: ["en", "es", "fr", "pl"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

export const INTRANET_LOCALES: Locale[] = ["en"];

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  pl: "Polski",
};

export const localeFlags: Record<Locale, string> = {
  en: "\u{1F1FA}\u{1F1F8}",
  es: "\u{1F1EA}\u{1F1F8}",
  fr: "\u{1F1EB}\u{1F1F7}",
  pl: "\u{1F1F5}\u{1F1F1}",
};
