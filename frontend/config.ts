import { getHomeUrl } from "./features";
import { notEmpty } from "./src/util/TypeUtil";

const presentOrThrow = (envvar: string | undefined) => {
    if (!envvar) throw "env variable not set";
    return envvar;
};

const uri = presentOrThrow(process.env.NEXT_PUBLIC_API_URL);

export const authRedirectUrl = `${uri}/login/redirect`;
export const apiUrl = `${uri}/api`;
export const appBase = presentOrThrow(process.env.NEXT_PUBLIC_BASE_URL);

export const httpStatuses = {
    notAuthorized: 403,
    notVerified: 401,
    alreadyCheckedIn: 202,
    unprocessable: 500,
} as const;

function buildSubPageUrl(subPage?: string, param?: string) {
    let url = "/request";
    if (subPage) url = `${url}?${subPage}`;
    if (notEmpty(param)) url = `${url}=${param}`;
    return url;
}

export const appUrls = {
    home: getHomeUrl(),
    setprofile: "/set-profile",
    verifyProfile: "/verify-profile",
    verifyNow: "/verify-now",
    profile: "/profile",
    loginMicrosoft: `${authRedirectUrl}/?next=${appBase}/`,
    createProfile: "/new",
    enterCode: "/checkin",
    checkin: (code: string): [string, string] => [
        "/checkin/[locationCode]",
        `/checkin/${code}`,
    ],
    checkout: (checkinId: number): [string, string] => [
        "/checkout/[checkinId]",
        `/checkout/${checkinId}`,
    ],
    requestSubpage: buildSubPageUrl,
    introduction: "/intro",
    privacy: "/privacy",
    help: "/help",
} as const;

export const requestSubpages = {
    zeit: {},
    raum: {},
    personen: {},
    "add-person": {},
    grund: {},
    nachricht: {},
    "resource-list": {}
} as const;

export const production = process.env.NODE_ENV === "production";
export const isClient = typeof window === "object";
export const isServer = typeof window === "undefined";

// language
export const defaultLocale = "en" as const;
export const baseLocale = "de" as const;
export const forceLocale: string | undefined = "de";
