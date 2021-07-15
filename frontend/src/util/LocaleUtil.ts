import { availableLocales, defaultLocale } from "../../config";
import { getInitialLocale, _t } from "../../localization";
import Locale from "../model/api/Locale";

export function getTypeSafeLocale(): Locale {
    const i = getInitialLocale() as unknown as Locale;
    return availableLocales.includes(i) ? i : defaultLocale;
}

export function getLocaleLabelMap(
    locale: string
): Record<Locale, string> {
    return {
        "de": _t(locale, "common", "Deutsch"),
        "en": _t(locale, "common", "English")
    };
}