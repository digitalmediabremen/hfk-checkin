import Document, {
    DocumentContext,
    Html,
    Head,
    Main,
    NextScript,
} from "next/document";
import { config } from "process";
import theme from "../styles/theme";

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);

        return initialProps;
    }

    render() {
        return (
            <Html>
                <Head>
                    <link rel="manifest" href="/manifest.json" />

                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="application-name" content="Checkin" />
                    <meta name="apple-mobile-web-app-title" content="Checkin" />
                    <meta name="theme-color" content="#D81830" />

                    <meta
                        name="msapplication-navbutton-color"
                        content="#D81830"
                    />
                    <meta
                        name="apple-mobile-web-app-status-bar-style"
                        content="black-translucent"
                    />
                    <meta name="msapplication-starturl" content="/" />

                    <link
                        rel="icon"
                        type="image/png"
                        sizes="512x512"
                        href="icons/icon-512x512"
                    />
                    <link
                        rel="apple-touch-icon"
                        type="image/png"
                        sizes="512x512"
                        href="icons/icon-512x512"
                    />
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="192x192"
                        href="icons/icon-192x192"
                    />
                    <link
                        rel="apple-touch-icon"
                        type="image/png"
                        sizes="192x192"
                        href="icons/icon-192x192"
                    />
                    <link
                        rel="icon"
                        type="image/png"
                        sizes="144x144"
                        href="icons/icon-144x144"
                    />
                    <link
                        rel="apple-touch-icon"
                        type="image/png"
                        sizes="144x144"
                        href="icons/icon-144x144"
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
