import { CommentStatement } from "ts-morph";

const presentOrThrow = (envvar: string | undefined) => {
    if (!envvar) throw "env variable not set";
    return envvar;
}

const uri = presentOrThrow(process.env.NEXT_PUBLIC_API_URL);

export const authRedirectUrl = `${uri}/login/redirect`;
export const apiUrl = `${uri}/api`;
export const appBase = presentOrThrow(process.env.NEXT_PUBLIC_BASE_URL);

export const httpStatuses = {
    "notAuthorized": 403,
    "alreadyCheckedIn": 202,
    "unprocessable": 500
} as const;

export const appUrls = {
    "setprofile": "/set-profile",
    "verifyProfile": "/verify-profile",
    "verifyNow": "/verify-now",
    "profile": "/profile",
    "loginMicrosoft": `${authRedirectUrl}/?next=${appBase}/`,
    "createProfile": "/new",
    "enterCode": "/",
    "checkin": (code: string): [string, string] => ["/checkin/[locationCode]", `/checkin/${code}`],
    "checkout": (checkinId: number): [string, string] => ["/checkout/[checkinId]", `/checkout/${checkinId}`],
    "introduction": "/intro",
    "privacy": "/privacy",
    "help": "/help"
} as const;

export const production = process.env.NODE_ENV === "production"

// language
export const defaultLocale = "en" as const;
export const baseLocale = "de" as const;
export const forceLocale: string | undefined = undefined;
