import Document, {
    DocumentContext,
    Head,
    Html,
    Main,
    NextScript,
} from "next/document";
import { getManifestUrl, getPrimaryColorHex, getTitle } from "../features";
import { getInitialLocale, LocaleConsumer } from "../localization";

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);
        return {
            ...initialProps,
            locale: getInitialLocale(ctx?.req?.headers),
        };
    }

    render() {
        return (
            <LocaleConsumer>
                {({ locale }) => (
                    <Html lang={locale} translate="no">
                        <Head>
                            <link rel="manifest" href={getManifestUrl()} />
                            <link
                                rel="icon"
                                type="image/x-icon"
                                href="/favicon.ico"
                            ></link>

                            <meta name="mobile-web-app-capable" content="yes" />
                            <meta
                                name="apple-mobile-web-app-capable"
                                content="yes"
                            />
                            <meta
                                name="application-name"
                                content={getTitle()}
                            />
                            <meta
                                name="apple-mobile-web-app-title"
                                content={getTitle()}
                            />
                            <meta name="theme-color" content={getPrimaryColorHex()} />

                            <meta
                                name="msapplication-navbutton-color"
                                content={getPrimaryColorHex()}
                            />
                            <meta
                                name="apple-mobile-web-app-status-bar-style"
                                content="default"
                            />
                            <meta name="msapplication-starturl" content="/" />

                            <link
                                rel="icon"
                                type="image/png"
                                sizes="512x512"
                                href="/icons/icon-512x512.png"
                            />
                            <link
                                rel="apple-touch-icon"
                                type="image/png"
                                sizes="512x512"
                                href="/icons/icon-192x192.png"
                            />
                            <link
                                rel="icon"
                                type="image/png"
                                sizes="192x192"
                                href="/icons/icon-192x192.png"
                            />
                            <link
                                rel="apple-touch-icon"
                                type="image/png"
                                sizes="192x192"
                                href="/icons/icon-192x192.png"
                            />
                            <link
                                rel="icon"
                                type="image/png"
                                sizes="144x144"
                                href="/icons/icon-144x144.png"
                            />
                            <link
                                rel="apple-touch-icon"
                                type="image/png"
                                sizes="144x144"
                                href="/icons/icon-144x144.png"
                            />
                        </Head>
                        <body>
                            <Main />
                            <NextScript />
                        </body>
                    </Html>
                )}
            </LocaleConsumer>
        );
    }
}

export default MyDocument;
