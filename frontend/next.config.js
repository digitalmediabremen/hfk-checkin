const withPWA = require("next-pwa");

module.exports = withPWA({
    pwa: {
        dest: "public",
        swSrc: "service-worker.js",
        disable: process.env.NODE_ENV === "development",
    },
    async headers() {
        return [
            {
                source: "/:slug*",
                headers: [{ key: "Cache-Control", value: "max-age=0" }],
            },
        ];
    },
});
