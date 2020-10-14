import "normalize.css";
import "../styles/globals.css";
import AppWrapper from "../components/common/AppWrapper";
import { AppStateProvider } from "../components/common/AppStateProvider";
import { AppProps } from "next/dist/next-server/lib/router/router";
import { LocaleProvider, getInitialLocale } from "../localization";
import Head from "next/head";

const MyApp = ({ Component, pageProps }: AppProps) => {
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
                    <LocaleProvider
                        locale={pageProps.locale || getInitialLocale()}
                    >
                        <Component {...pageProps} />
                    </LocaleProvider>
                </AppWrapper>
            </AppStateProvider>
        </>
    );
};

export default MyApp;
