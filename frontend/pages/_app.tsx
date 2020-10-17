import { AppProps } from "next/dist/next-server/lib/router/router";
import Head from "next/head";
import "normalize.css";
import { AppStateProvider } from "../components/common/AppStateProvider";
import AppWrapper from "../components/common/AppWrapper";
import ErrorDispatcher from "../components/common/ErrorDispatcher";
import { getInitialLocale, LocaleProvider } from "../localization";
import "../styles/globals.css";
import ErrorBoundary from "../components/common/ErrorBoundary";

const MyApp = ({ Component, pageProps }: AppProps) => {
    const { error, status, locale, ...props } = pageProps;

    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
                />
                <title>HfK-Checkin</title>
            </Head>
            <ErrorBoundary>
                <AppStateProvider>
                    <LocaleProvider locale={locale || getInitialLocale()}>
                        <ErrorDispatcher status={status} error={error}>
                            <AppWrapper>
                                <Component error={error} {...props} />
                            </AppWrapper>
                        </ErrorDispatcher>
                    </LocaleProvider>
                </AppStateProvider>
            </ErrorBoundary>
        </>
    );
};

export default MyApp;
