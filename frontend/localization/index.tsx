import getUserLocale from "get-user-locale";
import { IncomingHttpHeaders } from "http";
import {
    NextPage,
    GetServerSideProps,
    GetServerSidePropsContext,
    GetServerSidePropsResult,
} from "next";
import { createContext, SFC, useContext } from "react";
import { defaultLocale } from "../config";
import translation from "./translation";
import { getServerSideProps } from "../pages";
import { ParsedUrlQuery } from "querystring";

export type Translation = Record<
    string,
    Record<string, Record<string, string>>
>;

export const localeContext = createContext<{ locale: string }>({
    locale: defaultLocale,
});

export const getInitialLocale = (headers?: IncomingHttpHeaders) => {
    if (headers) {
        // server
        return (
            headers["accept-language"]?.split(",")?.[0]?.split("-")?.[0] ||
            defaultLocale
        );
    }
    // maybe client
    return getUserLocale()?.split("-")[0] || defaultLocale;
};

const { Provider } = localeContext;

export const LocaleProvider: SFC<{ locale: string }> = ({
    locale,
    children,
}) => {
    return <Provider value={{ locale: locale }}>{children}</Provider>;
};

export const useTranslation = (inModule: string = "common") => {
    const { locale } = useContext(localeContext);
    const t = (s: string, overwriteModule?: string) => {
        const m = overwriteModule || inModule;
        return (
            translation[locale]?.[m]?.[s] ||
            translation[locale]?.["common"]?.[s] ||
            `t(${locale}.${m}.${s})`
        );
    };
    // @ts-ignore
    return { locale, t };
};

export const withLocaleProp = (    
    func: (
        context: GetServerSidePropsContext<ParsedUrlQuery>
    ) => Promise<GetServerSidePropsResult<{ [key: string]: any }>>
) => {
    return async function withLocalPropHandler(context: GetServerSidePropsContext) {
        return {
            props: {
                locale: getInitialLocale(context.req.headers),
                ...(await func(context)).props
            }
        }
    };
};

export const withTranslation = <P extends {}>(
    WrappedComponent: React.ComponentType<P>
) => {
    const Comp2: NextPage<{ locale: string }> = ({ locale, ...props }) => {
        return (
            <LocaleProvider locale={locale}>
                <WrappedComponent {...(props as P)} />
            </LocaleProvider>
        );
    };

    Comp2.getInitialProps = async (context) => {
        const locale = getInitialLocale(context.req?.headers);
        return {
            locale,
        };
    };

    return Comp2;
};

export default translation;
