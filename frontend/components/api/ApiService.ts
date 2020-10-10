import Profile, { ProfileUpdate, assertProfile } from "../../model/Profile";
import * as config from "../../config";
import { NextPageContext } from "next";
import { Location } from "../../model/Location";
import { ServerResponse } from "http";
import { Checkin } from "../../model/Checkin";

export type ApiResponse<T> =
    | {
          error: string;
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
    requestData?: RequestInit,
    isTypeOrThrow?: (p: any) => asserts p is ResultType
): Promise<Response<ResultType>> => {
    try {
        const request = await fetch(`${config.apiUrl}/${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: "include",
            ...requestData,
        });

        console.log("request ok", request.ok);
        if (request.status === 404)
            return { error: "Api method not found", status: 404 };
        const response = (await (request.json() as unknown)) as ApiResponse<
            ResultType
        >;

        if (request.status >= 400) {
            return {
                error: response.detail,
                status: request.status,
            };
        }

        if (!!isTypeOrThrow) isTypeOrThrow(response);

        console.log(response);
        return {
            status: request.status,
            data: response as ResultType,
        };
    } catch (error) {
        console.error(error);
        // client error
        return {
            error: error.message || error,
            status: 600,
        };
    }
};

export const updateProfileRequest = async (
    profile: ProfileUpdate,
    headers?: HeadersInit
) =>
    await apiRequest("profile/me/", {
        method: "POST",
        body: JSON.stringify(profile),
        headers,
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
