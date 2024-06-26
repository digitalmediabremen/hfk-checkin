import { envToBoolean, getHomeUrl } from "./features";
import { notEmpty } from "./src/util/TypeUtil";

const presentOrThrow = (envvar: string | undefined) => {
    if (!envvar) throw "env variable not set";
    return envvar;
};

export function buildSubPageUrl(
    base: string,
    subPage?: string,
    param?: string
) {
    let url = base;
    if (notEmpty(subPage)) url = `${url}?${subPage}`;
    if (notEmpty(param)) url = `${url}=${param}`;
    return url;
}

export const backendBase = presentOrThrow(process.env.NEXT_PUBLIC_API_URL);

export const authRedirectUrl = `${backendBase}/login/redirect`;
export const apiUrl = `${backendBase}/api`;
export const backendUrl = `${backendBase}/backend`;
export const appBase = presentOrThrow(process.env.NEXT_PUBLIC_BASE_URL);
export const appDisabled = envToBoolean(process.env.NEXT_PUBLIC_APP_DISABLED);

export const bookingDisabled = envToBoolean(process.env.BOOKING_DISABLED);

export const httpStatuses = {
    notFound: 404,
    notAuthorized: 403,
    notVerified: 401,
    alreadyCheckedIn: 202,
    unprocessable: 500,
} as const;

export const appUrls = {
    home: getHomeUrl(),
    setprofile: "/set-profile",
    verifyProfile: "/verify-profile",
    verifyNow: "/verify-now",
    profile: "/profile",
    loginMicrosoft: `${authRedirectUrl}/?next=${appBase}${getHomeUrl()}/?from-auth=1`,
    createProfile: "/new",
    enterCode: "/checkin",
    logout: `${backendBase}/logout/?next=${appBase}${getHomeUrl()}`,
    checkin: (code: string): [string, string] => [
        "/checkin/[locationCode]",
        `/checkin/${code}`,
    ],
    checkout: (checkinId: number): [string, string] => [
        "/checkout/[checkinId]",
        `/checkout/${checkinId}`,
    ],
    reservation: (reservationId: string): [string, string] => [
        "/reservation/[reservationId]",
        `/reservation/${reservationId}`,
    ],
    resourceList: (unitSlug: string) => [
        "/rooms/[unitslug]",
        `/rooms/${unitSlug}`,
    ],
    resource: (
        unitSlug: string,
        resourceShortId: string,
        resourceName: string
    ) => [
        "/rooms/[unitslug]/[resourcename]/[resourceid]",
        `/rooms/${unitSlug}/${resourceName}/${resourceShortId}`,
    ],
    reservations: "/reservation",
    request: "/request",
    introduction: "/intro",
    privacy: "/privacy",
    help: "/help",
    cookieError: "/cookie-error",
    room: "/rooms",
} as const;

export const requestSubpages = {
    urlProvider: (subPageId?: string, param?: string) =>
        buildSubPageUrl(appUrls.request, subPageId, param),
    subpages: {
        time: {},
        resource: {},
        attendees: {},
        "attendee-set": {},
        purpose: {},
        message: {},
        "resource-list": {},
    },
} as const;

export const pageTransitionDuration = 300;

export const environment = presentOrThrow(
    process.env.NEXT_PUBLIC_ENVIRONMENT
) as "production" | "staging" | "development";
export const isClient = typeof window === "object";
export const isServer = typeof window === "undefined";

// language
export const availableLocales = ["de", "en"] as const;
export const defaultLocale = "en" as const;
export const baseLocale = "de" as const;
export const forceLocale: string | undefined = undefined;
