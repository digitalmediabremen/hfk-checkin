import { AppProps } from "next/dist/next-server/lib/router/router";
import Head from "next/head";
import "normalize.css";
import { AppStateProvider } from "../components/common/AppStateProvider";
import AppWrapper from "../components/common/AppWrapper";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { getTitle } from "../features";
import { getInitialLocale, LocaleProvider } from "../localization";
import { init } from "../src/util/Sentry";
import "../styles/globals.css";

init();

const MyApp = ({ Component }: AppProps) => {
    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
                />
                <title>{getTitle()}</title>
            </Head>
            <ErrorBoundary>
                <AppStateProvider>
                    <LocaleProvider locale={getInitialLocale()}>
                        <AppWrapper>
                            <Component />
                        </AppWrapper>
                    </LocaleProvider>
                </AppStateProvider>
            </ErrorBoundary>
        </>
    );
};

export default MyApp;
