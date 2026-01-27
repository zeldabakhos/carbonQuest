import * as Localization from "expo-localization";

type LocaleLike = {
  region?: string | null;
  country?: string | null;        // some builds use "country"
  languageTag?: string;           // e.g. "fr-FR"
};

// Cache the country code so we only call getLocales() once
let cachedCountryCode: string | undefined = undefined;
let hasCached = false;

export function getUserCountryCode(): string | undefined {
  if (hasCached) {
    return cachedCountryCode;
  }

  try {
    const locales = Localization.getLocales() as unknown as LocaleLike[];

    const first = locales?.[0];
    const region =
      (first?.region ?? first?.country ?? undefined) ||
      // fallback: extract from languageTag like "fr-FR"
      (first?.languageTag?.split("-")[1] ?? undefined);

    cachedCountryCode = region ? region.toUpperCase() : undefined;
  } catch (error) {
    console.warn("Failed to get user country code:", error);
    cachedCountryCode = undefined;
  }

  hasCached = true;
  return cachedCountryCode;
}
