import "normalize.css";
import "../styles/globals.css";
import AppWrapper from "../components/common/AppWrapper";
import { AppStateProvider } from "../components/common/AppStateProvider";
import { AppProps } from "next/dist/next-server/lib/router/router";

const MyApp = ({ Component, pageProps }: AppProps) => {
    return (
        <AppStateProvider>
            <AppWrapper>
                <Component {...pageProps} />
            </AppWrapper>
        </AppStateProvider>
    );
}

export default MyApp;
