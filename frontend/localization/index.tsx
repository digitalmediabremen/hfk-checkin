import getUserLocale from "get-user-locale";
import { IncomingHttpHeaders } from "http";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { ParsedUrlQuery } from "querystring";
import { createContext, SFC, useContext } from "react";
import { appUrls, defaultLocale, production, baseLocale, forceLocale } from "../config";
import translation from "./translation";

export type Translation = Record<
    string,
    Partial<Record<TranslationModules, Record<string, string>>>
>;

export type TranslationModules = Partial<keyof typeof appUrls> | "common";

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
    return getUserLocale()?.split("-")[0] || defaultLocale;
};

const { Provider } = localeContext;

export const LocaleProvider: SFC<{ locale: string }> = ({
    locale,
    children,
}) => {
    return <Provider value={{ locale }}>{children}</Provider>;
};

type PatternInput = string | number;

export const useTranslation = (inModule: TranslationModules = "common") => {
    const { locale } = useContext(localeContext);
    const t = (
        s: string,
        data?: Record<string, PatternInput>,
        alternativeId?: string
    ): string => {
        const id = alternativeId || s;
        const replace = (string?: string) =>
            string?.replace(
                /{([A-Za-z]+)}/g,
                (string: string, match: string) =>
                    `${
                        !!data && data[match] !== undefined
                            ? data[match]
                            : string
                    }`
            );
        if (locale === baseLocale) return replace(s)!;
        const translatedString =
            replace(translation[locale]?.[inModule]?.[id]) ||
            replace(translation[locale]?.["common"]?.[id]);
        const translationId = `${locale}.${inModule}.["${id}"]${
            alternativeId ? ` to "${s}"` : ""
        }`;
        if (production && translatedString === undefined)
            console.error(`No translation for ${translationId} provided`);

        return translatedString || translationId;
    };
    return { locale, t };
};

export const withLocaleProp = (
    func: (
        context: GetServerSidePropsContext<ParsedUrlQuery>
    ) => Promise<GetServerSidePropsResult<{ [key: string]: any }>>
) => {
    return async function withLocalPropHandler(
        context: GetServerSidePropsContext
    ) {
        return {
            props: {
                locale: getInitialLocale(context.req.headers),
                ...(await func(context)).props,
            },
        };
    };
};

// export const withTranslation = <P extends {}>(
//     WrappedComponent: React.ComponentType<P>
// ) => {
//     const Comp2: NextPage<{ locale: string }> = ({ locale, ...props }) => {
//         return (
//             <LocaleProvider locale={locale}>
//                 <WrappedComponent {...(props as P)} />
//             </LocaleProvider>
//         );
//     };

//     Comp2.getInitialProps = async (context) => {
//         const locale = getInitialLocale(context.req?.headers);
//         return {
//             locale,
//         };
//     };

//     return Comp2;
// };

export default translation;
