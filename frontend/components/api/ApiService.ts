import Profile, { ProfileUpdate, assertProfile } from "../../model/Profile";
import * as config from "../../config";
import { NextPageContext } from "next";
import { Location } from "../../model/Location";
import { ServerResponse } from "http";
import { Checkin } from "../../model/Checkin";

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

export const apiRequest = async <ResultType extends Record<string, any> = {}>(
    endpoint: string,
    requestData: RequestInit,
    isTypeOrThrow?: (p: any) => asserts p is ResultType
): Promise<Response<ResultType>> => {
    const url = `${config.apiUrl}/${endpoint}`;
    console.log("request: ", url);
    const { headers, ...otherRequestData } = requestData;
    return await fetch(url, {
        headers: {
            "content-type": "application/json",
            ...headers
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: "include",
        ...otherRequestData,
    })
        .then(async (response) => ({
            data: (await (response.json() as unknown)) as ApiResponse<
                ResultType
            >,
            status: response.status,
        }))
        .then(({ data, status }) => {
            if (status > 400) {
                throw {
                    status: status,
                    error: data.detail,
                };
            }
            return { data, status };
        })
        .then(({ data: typedData, status }) => {
            // @ts-ignore
            if (!!isTypeOrThrow) isTypeOrThrow(typedData);
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
                error: error.message || error,
                status: 0,
            };
        });
};

export const updateProfileRequest = async (
    profile: ProfileUpdate,
    headers?: HeadersInit
) =>
    await apiRequest("profile/me/save/", {
        method: "POST",
        body: JSON.stringify(profile),
        headers
    });

export const doCheckinRequest = async (
    locationCode: string,
    headers?: HeadersInit
) =>
    await apiRequest<Checkin>(`location/${locationCode}/checkin/`, {
        headers,
    });

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

export const redirectServerSide = (
    serverResponse: ServerResponse,
    toPath: string
) => {
    serverResponse.writeHead(302, {
        Location: toPath,
    });
    serverResponse.end();
};
