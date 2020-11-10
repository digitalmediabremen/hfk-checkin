import Profile, { ProfileUpdate, assertProfile } from "../../model/Profile";
import * as config from "../../config";
import { NextPageContext } from "next";
import { Location } from "../../model/Location";
import { ServerResponse } from "http";
import { Checkin, CheckinOrigin, LastCheckin } from "../../model/Checkin";

export type ApiResponse<T> =
    | {
          detail: string;
      }
    | T;

export type Response<ResultType extends Record<string, any> = {}> = {
    status: number;
    data?: ResultType;
    error?: string;
};

export type RequestParameters = Record<string, string | undefined>;

export type RequestOptions<T extends RequestParameters = {}> = {
    headers?: HeadersInit;
    requestParameters?: T;
};

export interface RequestBody extends Omit<RequestInit, "credentials"> {
    requestParameters?: RequestParameters;
}

const toQueryString = (params?: RequestParameters) => {
    if (!params) return "";
    return Object.entries(params).reduce((prev, [key, value], index) => {
        const pre = index === 0 ? "?" : "&";
        return `${prev}${pre}${value ? `${key}=${value}` : key}`
    }, "");
}

export const apiRequest = async <ResultType extends Record<string, any> = {}>(
    endpoint: string,
    requestData: RequestBody,
    responseTypeGuard?: (p: any) => asserts p is ResultType
): Promise<Response<ResultType>> => {
    const { headers, requestParameters, ...otherRequestData } = requestData;
    const stringifiedRequestParameters = toQueryString(requestParameters)
    const url = `${config.apiUrl}/${endpoint}${stringifiedRequestParameters}`;
    const forceLocaleHeader = config.forceLocale
        ? { "Accept-Language": config.forceLocale }
        : undefined;
    return await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...headers,
            ...forceLocaleHeader,
        },
        credentials: "include",
        ...otherRequestData,
    })
        .then(async (response) => ({
            data: ((await response?.json?.()) as unknown) as
                | ApiResponse<ResultType>
                | undefined,
            status: response.status,
        }))
        .then(({ data, status }) => {
            if (data === undefined)
                throw {
                    status: config.httpStatuses.unprocessable,
                    error: "Response could not be serialized",
                };
            if (status >= 400) {
                if (!data.detail)
                    throw {
                        status: status,
                        error:
                            "Api responded with wrong format.\n Http Error Codes should contain a detail field",
                    };
                throw {
                    status: status,
                    error: data.detail,
                };
            }

            return { data, status };
        })
        .then(({ data: typedData, status }) => {
            // @ts-ignore
            if (!!responseTypeGuard) responseTypeGuard(typedData);
            return {
                typedData,
                status,
            };
        })
        .then(({ typedData, status }) => ({
            status: status,
            data: typedData as ResultType,
        }))
        .catch((error) => {
            console.error(error);
            if (error.error !== undefined) return error;
            return {
                error: "You are most likely offline.",
                status: config.httpStatuses.unprocessable,
            };
        });
};

export const updateProfileRequest = async (
    profile: ProfileUpdate,
    headers?: HeadersInit
) =>
    await apiRequest<Profile>("profile/me/save/", {
        method: "POST",
        body: JSON.stringify(profile),
        headers,
    });

export const getCheckinsRequest = async (
    options?: RequestOptions<{
        active?: undefined
    }>
) => {
    return await apiRequest<LastCheckin[]>("checkin/", {
        method: "GET",
        ...options
    });
};

export const doCheckinRequest = async (
    locationCode: string,
    options?: RequestOptions<{
        origin?: CheckinOrigin;
    }>
) => {
    return await apiRequest<Checkin>(`location/${locationCode}/checkin/`, {
        ...options,
    });
};

export const doCheckoutRequest = async (
    locationCode: string,
    headers?: HeadersInit
) =>
    await apiRequest<Checkin>(`location/${locationCode}/checkout/`, {
        headers,
    });

export const getLocationRequest = async (
    locationCode: string,
    headers?: HeadersInit
) =>
    await apiRequest<Location>(`location/${locationCode}/`, {
        headers,
    });

export const getProfileRequest = async (headers?: HeadersInit) =>
    await apiRequest<Profile>("profile/me/", { headers }, assertProfile);

export const getCheckinRequest = async (
    checkinId: string,
    options?: RequestOptions
) => await apiRequest<LastCheckin>(`checkin/${checkinId}/`, { ...options });

export const redirectServerSide = (
    serverResponse: ServerResponse,
    toPath: string
) => {
    serverResponse.writeHead(302, {
        Location: toPath,
    });
    serverResponse.end();
};
