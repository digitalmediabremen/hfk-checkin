
const presentOrThrow = (envvar) => {
    if (!envvar) throw "env variable not set";
    return envvar;
}

export const authRedirectUrl = presentOrThrow(process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL);
export const apiUrl = presentOrThrow(process.env.NEXT_PUBLIC_API_URL);
export const appUrl = presentOrThrow(process.env.NEXT_PUBLIC_BASE_URL);