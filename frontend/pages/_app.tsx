import "normalize.css";
import "../styles/globals.css";
import AppWrapper from "../components/common/AppWrapper";
import { AppStateProvider } from "../components/common/AppStateProvider";

function MyApp({ Component, pageProps }) {
    return (
        <AppStateProvider>
            <AppWrapper>
                <Component {...pageProps} />
            </AppWrapper>
        </AppStateProvider>
    );
}

export default MyApp;
