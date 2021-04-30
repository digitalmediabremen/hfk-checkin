import getUserLocale from "get-user-locale";
import { IncomingHttpHeaders } from "http";
import { browser } from "process";
import { createContext, useCallback, useContext, useEffect } from "react";
import { useAppState } from "../components/common/AppStateProvider";
import {
    appUrls,
    baseLocale,
    defaultLocale,
    forceLocale,
    environmentIsProduction,
    requestSubpages,
} from "../config";
import translation from "./translation";

export type Translation = Record<
    string,
    Partial<Record<TranslationModules, Record<string, string>>>
>;

export type ConvertRequestPageNames<T extends string> = `request-${T}`;
export type RequestSubpagesModuleType = ConvertRequestPageNames<
    keyof typeof requestSubpages["subpages"]
>;
export type TranslationModules =
    | keyof typeof appUrls
    | "common"
    | RequestSubpagesModuleType;

export const localeContext = createContext<{ locale: string }>({
    locale: defaultLocale,
});

export const getInitialLocale = (headers?: IncomingHttpHeaders) => {
    if (forceLocale) return forceLocale;
    if (headers) {
        // server
        return (
            // @ts-ignore
            headers["accept-language"]?.split(",")?.[0]?.split("-")?.[0] ||
            defaultLocale
        );
    }
    const browserLocale = getUserLocale()?.split("-")[0] || defaultLocale;
    // if browser locale is not part of the translated locales revert to default locale
    if (![baseLocale, ...Object.keys(translation)].includes(browserLocale))
        return defaultLocale;

    return browserLocale;
};

const { Provider } = localeContext;

export const LocaleConsumer = localeContext.Consumer;

export const LocaleProvider: React.FunctionComponent<{ locale: string }> = ({
    locale,
    children,
}) => {
    const { dispatch } = useAppState();
    useEffect(() => {
        dispatch({ type: "updateLocale", locale });
    }, [locale]);
    return <Provider value={{ locale }}>{children}</Provider>;
};

type PatternInput = string | number;

export type TFunction = (
    s: string,
    data?: Record<string, PatternInput>,
    alternativeId?: string
) => string;

export type TranslationFunction = (
    locale: string,
    inModule: TranslationModules,
    s: string,
    data?: Record<string, PatternInput>,
    alternativeId?: string
) => string;

export const useTranslation = (inModule: TranslationModules = "common") => {
    const { locale } = useContext(localeContext);
    const t: TFunction = useCallback(
        (s, data?, alternativeId?) =>
            _t(locale, inModule, s, data, alternativeId),
        []
    );
    return { locale, t };
};

export function _t(
    locale: string,
    inModule: TranslationModules,
    s: string,
    data?: Record<string, PatternInput>,
    alternativeId?: string
) {
    const id = alternativeId || s;
    const replace = (string?: string) =>
        string?.replace(
            /{([A-Za-z]+)}/g,
            (string: string, match: string) =>
                `${!!data && data[match] !== undefined ? data[match] : string}`
        );
    if (locale === baseLocale) return replace(s)!;
    const translatedString =
        replace(translation[locale]?.[inModule]?.[id]) ||
        replace(translation[locale]?.["common"]?.[id]);
    const translationId = `${locale}.${inModule}.["${id}"]${
        alternativeId ? ` to "${s}"` : ""
    }`;
    if (!environmentIsProduction && translatedString === undefined)
        console.error(`No translation for ${translationId} provided`);

    return translatedString || translationId;
}

export default translation;
