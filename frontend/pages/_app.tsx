import { AppProps } from "next/dist/next-server/lib/router/router";
import Head from "next/head";
import "normalize.css";
import { AppStateProvider } from "../components/common/AppStateProvider";
import AppWrapper from "../components/common/AppWrapper";
import ErrorDispatcher from "../components/common/ErrorDispatcher";
import { getInitialLocale, LocaleProvider } from "../localization";
import "../styles/globals.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
    const { error, locale, ...props } = pageProps;

    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
                />
            </Head>
            <AppStateProvider>
                <AppWrapper>
                    <LocaleProvider locale={locale || getInitialLocale()}>
                        <ErrorDispatcher error={error}>
                            <Component error={error} {...props} />
                        </ErrorDispatcher>
                    </LocaleProvider>
                </AppWrapper>
            </AppStateProvider>
        </>
    );
};

export default MyApp;
