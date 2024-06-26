const withPWA = require("next-pwa");
const features = require("./features");
const withModernizr = require("next-plugin-modernizr");

// Use the SentryWebpack plugin to upload the source maps during build step
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const {
    NEXT_PUBLIC_SENTRY_DSN: SENTRY_DSN,
    SENTRY_ORG,
    SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN,
    NODE_ENV,
    SOURCE_VERSION: HEROKU_SOURCE_VERSION,
} = process.env;

process.env.SENTRY_DSN = SENTRY_DSN;
const basePath = "";

const withTM = require("next-transpile-modules")([
    "@fullcalendar/react",
    "@fullcalendar/common",
    "@fullcalendar/timegrid",
    "@fullcalendar/daygrid",
]); // pass the modules you would like to see transpiled

module.exports = withTM(
    withModernizr(
        withPWA({
            productionBrowserSourceMaps: true,
            env: {
                // heroku specific build id
                NEXT_PUBLIC_COMMIT_SHA: HEROKU_SOURCE_VERSION,
            },
            webpack: (config, options) => {
                // In `pages/_app.js`, Sentry is imported from @sentry/browser. While
                // @sentry/node will run in a Node.js environment. @sentry/node will use
                // Node.js-only APIs to catch even more unhandled exceptions.
                //
                // This works well when Next.js is SSRing your page on a server with
                // Node.js, but it is not what we want when your client-side bundle is being
                // executed by a browser.
                //
                // Luckily, Next.js will call this webpack function twice, once for the
                // server and once for the client. Read more:
                // https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
                //
                // So ask Webpack to replace @sentry/node imports with @sentry/browser when
                // building the browser's bundle
                if (!options.isServer) {
                    config.resolve.alias["@sentry/node"] = "@sentry/browser";
                }

                // Define an environment variable so source code can check whether or not
                // it's running on the server so we can correctly initialize Sentry
                config.plugins.push(
                    new options.webpack.DefinePlugin({
                        "process.env.NEXT_IS_SERVER": JSON.stringify(
                            options.isServer.toString()
                        ),
                    })
                );

                // When all the Sentry configuration env variables are available/configured
                // The Sentry webpack plugin gets pushed to the webpack plugins to build
                // and upload the source maps to sentry.
                // This is an alternative to manually uploading the source maps
                // Note: This is disabled in development mode.
                if (
                    SENTRY_DSN &&
                    SENTRY_ORG &&
                    SENTRY_PROJECT &&
                    SENTRY_AUTH_TOKEN &&
                    HEROKU_SOURCE_VERSION &&
                    NODE_ENV === "production"
                ) {
                    config.plugins.push(
                        new SentryWebpackPlugin({
                            include: ".next",
                            ignore: ["node_modules"],
                            stripPrefix: ["webpack://_N_E/"],
                            urlPrefix: `~${basePath}/_next`,
                            release: HEROKU_SOURCE_VERSION,
                            deleteAfterCompile: true,
                        })
                    );
                }
                return config;
            },
            basePath,
            pwa: {
                dest: "public",
                swSrc: "service-worker.js",
                register: false,
                skipWaiting: true,
                disable: process.env.NODE_ENV === "development",
                publicExcludes: ["!**/*.js.map"],
                buildExcludes: [/.*\.js\.map$/],
            },
            generateEtags: false,
            async headers() {
                return [
                    {
                        source: "/:slug*",
                        headers: [{ key: "Cache-Control", value: "max-age=0" }],
                    },
                ];
            },
            async rewrites() {
                return [
                    {
                        source: "/",
                        destination: features.getHomeUrl(),
                    },
                ];
            },
            async redirects() {
                return [
                    {
                        source: "/rooms", // automatically becomes /docs/with-basePath
                        destination: "/rooms/XI", // automatically becomes /docs/another
                        permanent: false,
                    },
                ];
            },
        })
    )
);
