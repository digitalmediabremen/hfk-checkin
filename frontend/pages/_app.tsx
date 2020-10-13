import "normalize.css";
import "../styles/globals.css";
import AppWrapper from "../components/common/AppWrapper";
import { AppStateProvider } from "../components/common/AppStateProvider";
import { AppProps } from "next/dist/next-server/lib/router/router";
import { LocaleProvider, getInitialLocale } from "../localization";

const MyApp = ({ Component, pageProps }: AppProps) => {
    return (
        <AppStateProvider>
            <AppWrapper>
                <LocaleProvider locale={pageProps.locale || getInitialLocale()}>
                    <Component {...pageProps} />
                </LocaleProvider>
            </AppWrapper>
        </AppStateProvider>
    );
}

export default MyApp;
