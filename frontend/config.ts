
const presentOrThrow = (envvar: string | undefined) => {
    if (!envvar) throw "env variable not set";
    return envvar;
}

const uri = presentOrThrow(process.env.NEXT_PUBLIC_API_URL);

export const authRedirectUrl = `${uri}/login/redirect`;
export const apiUrl = `${uri}/api`;
export const appUrl = presentOrThrow(process.env.NEXT_PUBLIC_BASE_URL);