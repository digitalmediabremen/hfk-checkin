import { skipWaiting, clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { apiUrl } from "./config";

import {
    NetworkOnly,
    NetworkFirst,
    CacheFirst,
    StaleWhileRevalidate,
} from "workbox-strategies";
import {
    registerRoute,
    setDefaultHandler,
    setCatchHandler,
} from "workbox-routing";
import {
    matchPrecache,
    precacheAndRoute,
    cleanupOutdatedCaches,
} from "workbox-precaching";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

skipWaiting();
clientsClaim();

// must include following lines when using inject manifest module from workbox
// https://developers.google.com/web/tools/workbox/guides/precache-files/workbox-build#add_an_injection_point
const WB_MANIFEST = self.__WB_MANIFEST;
// Precache fallback route and image
WB_MANIFEST.push({
    url: "/offline",
    revision: "1234567891",
});
precacheAndRoute(WB_MANIFEST);

cleanupOutdatedCaches();
registerRoute(
    "/profile",
    new StaleWhileRevalidate({
        cacheName: "start-url",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 1,
                maxAgeSeconds: 3600,
                purgeOnQuotaError: !0,
            }),
        ],
    }),
    "GET"
);
registerRoute(
    /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    new CacheFirst({
        cacheName: "google-fonts",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 4,
                maxAgeSeconds: 31536e3,
                purgeOnQuotaError: !0,
            }),
        ],
    }),
    "GET"
);
registerRoute(
    /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    new StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 8,
                maxAgeSeconds: 604800,
                purgeOnQuotaError: !0,
            }),
        ],
    }),
    "GET"
);
// disable image cache, so we could observe the placeholder image when offline
registerRoute(
    /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    new NetworkFirst({
        cacheName: "static-image-assets",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 64,
                maxAgeSeconds: 3600,
                purgeOnQuotaError: !0,
            }),
        ],
    }),
    "GET"
);
registerRoute(
    /\.(?:js)$/i,
    new StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 32,
                maxAgeSeconds: 3600,
                purgeOnQuotaError: !0,
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
    "GET"
);
registerRoute(
    /\.(?:css|less)$/i,
    new StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 32,
                maxAgeSeconds: 3600,
                purgeOnQuotaError: !0,
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
    "GET"
);
///_next\/data\/(.*)\.json/i
registerRoute(
    /_next\/data\/(.*)\.json/i,
    ({ url, event, params }) => {
        const strategy = new NetworkOnly();
        return strategy.handle(event).catch(() => matchPrecache("/offline-props.json"));
    },
    "GET"
);

registerRoute(
    /\.(?:json|xml|csv)$/i,
    new NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 32,
                maxAgeSeconds: 3600,
                purgeOnQuotaError: !0,
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    }),
    "GET"
);

// cache location requests
registerRoute(
    ({ request }) => request.url.match(/api\/location\/[0-9]+\/$/i) !== null,
    new StaleWhileRevalidate({
        cacheName: "api-cached",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 50,
                purgeOnQuotaError: !0,
            }),
        ],
    })
)

// dont cache other requests
registerRoute(
    ({ request }) => {
        return request.url.match(/api\/.*$/i) !== null
    },
    new NetworkOnly()
);
// registerRoute(
//     /^https:\/\/app\.checkin\.hfk-bremen\.de\/api\/.*/i,
//     new NetworkOnly({
//         cacheName: "apis",
//         networkTimeoutSeconds: 10,
//         plugins: [
//             new ExpirationPlugin({
//                 maxEntries: 16,
//                 maxAgeSeconds: 3600,
//                 purgeOnQuotaError: !0,
//             }),
//             new CacheableResponsePlugin({
//                 statuses: [0, 200, 201, 202],
//             }),
//         ],
//     }),
//     "GET"
// );
// registerRoute(
//     /^https:\/\/app\.checkin\.hfk-bremen\.de\/api\/.*/i,
//     new NetworkOnly(),
//     "POST"
// );

// registerRoute(
//     /.*/i,
//     new StaleWhileRevalidate({
//         cacheName: "others",
//         networkTimeoutSeconds: 10,
//         plugins: [
//             new CacheableResponsePlugin({
//                 statuses: [0, 200],
//             }),
//             new ExpirationPlugin({
//                 maxEntries: 32,
//                 maxAgeSeconds: 86400,
//                 purgeOnQuotaError: !0,
//             }),
//         ],
//     }),
//     "GET"
// );

// following lines gives you control of the offline fallback strategies
// https://developers.google.com/web/tools/workbox/guides/advanced-recipes#comprehensive_fallbacks

// Use a stale-while-revalidate strategy for all other requests.
setDefaultHandler(
    new StaleWhileRevalidate({
        cacheName: "others",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24 * 2,
                purgeOnQuotaError: !0,
            }),
        ],
    })
);

// This "catch" handler is triggered when any of the other routes fail to
// generate a response.
setCatchHandler(({ event, url }) => {
    // The FALLBACK_URL entries must be added to the cache ahead of time, either
    // via runtime or precaching. If they are precached, then call
    // `matchPrecache(FALLBACK_URL)` (from the `workbox-precaching` package)
    // to get the response from the correct cache.
    //
    // Use event, request, and url to figure out how to respond.
    // One approach would be to use request.destination, see
    // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
    console.log(event.request.destination, event.request);
    switch (event.request.destination) {
        case "document":
            // If using precached URLs:
            return matchPrecache("/offline");
            // return caches.match('/fallback')
            break;
        case "font":
        // If using precached URLs:
        // return matchPrecache(FALLBACK_FONT_URL);
        //return caches.match('/static/fonts/fallback.otf')
        //break
        default:
            // If we don't have a fallback, just return an error response.
            return Response.error();
    }
});
