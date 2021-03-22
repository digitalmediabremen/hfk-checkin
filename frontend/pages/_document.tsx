import Document, {
    DocumentContext,
    Head,
    Html,
    Main,
    NextScript,
} from "next/document";
import {
    getManifestUrl,
    getName,
    getPrimaryColorHex,
    getTitle,
} from "../features";
import { getInitialLocale, LocaleConsumer } from "../localization";

const iconSizes = ["512x512", "192x192", "144x144"];
const applicationName = getName();
const iconMetaTags = iconSizes.map((size) => (
    <>
        <link
            key={`${applicationName}-icon-${size}`}
            rel="icon"
            type="image/png"
            sizes={size}
            href={`/icons/${applicationName}/icon-${size}.png`}
        />
        <link
            key={`${applicationName}-icon-${size}-apple`}
            rel="apple-touch-icon"
            type="image/png"
            sizes={size}
            href={`/icons/${applicationName}/icon-${size}.png`}
        />
    </>
));

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

                            <link
                                rel="preload"
                                as="font"
                                href="/fonts/DINWebPro.woff"
                                type="font/woff"
                                crossOrigin="anonymous"
                            />
                            <link
                                rel="preload"
                                as="font"
                                href="/fonts/DINWebPro-Bold.woff"
                                type="font/woff"
                                crossOrigin="anonymous"
                            />
                            <link
                                rel="preload"
                                as="font"
                                href="/fonts/DINWebPro-Ita.woff"
                                type="font/woff"
                                crossOrigin="anonymous"
                            />
                            <link
                                rel="preload"
                                as="font"
                                href="/fonts/DINWebPro-BoldIta.woff"
                                type="font/woff"
                                crossOrigin="anonymous"
                            />
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
                            <meta
                                name="theme-color"
                                content={getPrimaryColorHex()}
                            />

                            <meta
                                name="msapplication-navbutton-color"
                                content={getPrimaryColorHex()}
                            />
                            <meta
                                name="apple-mobile-web-app-status-bar-style"
                                content="default"
                            />
                            <meta name="msapplication-starturl" content="/" />

                            {iconMetaTags}
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
