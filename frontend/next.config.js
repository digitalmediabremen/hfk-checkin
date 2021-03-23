const withPWA = require("next-pwa");
const features = require("./features");



module.exports = withPWA({
    pwa: {
        dest: "public",
        swSrc: 'service-worker.js',
        register: false,
        skipWaiting: true,
        disable: process.env.NODE_ENV === "development",
    },
    generateEtags: false,
    async headers() {
        return [
            {
                source: "/:slug*",
                headers: [{ key: "Cache-Control", value: "max-age=3600" }],
            },
        ];
    },
    async rewrites() {
        return [
          {
            source: '/',
            destination: features.getHomeUrl(),
          },
        ]
      },
});
