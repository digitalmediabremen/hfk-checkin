
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
} as const;
export const appUrls = {
    "profile": "/profile",
    "notVerified": "/check-identity",
    "redirect": `${authRedirectUrl}/?next=${appBase}/profile`,
    "createProfile": "/new",
    "enterCode": "/",
    "checkin": (code: string): [string, string] => ["/checkin/[locationCode]", `/checkin/${code}`],
    "introduction": "/intro",
} as const;

export const production = process.env.NODE_ENV === "production"

// language
export const defaultLocale = "de" as const;
