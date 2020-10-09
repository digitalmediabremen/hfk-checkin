import Profile, { ProfileUpdate, assertProfile } from "../../model/Profile";
import * as config from "../../config";
import { NextPageContext } from "next";

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
            ...requestData,
        });
        console.log("request ok", request.ok)
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
    await apiRequest("profile/", {
        method: "POST",
        body: JSON.stringify(profile),
        headers,
    });

export const doCheckinRequest = async (
    locationCode: string,
    headers?: HeadersInit
) =>
    await apiRequest("checkin/", {
        method: "POST",
        body: JSON.stringify({ locationCode }),
        headers,
    });

export const getLocationRequest = async (
    locationCode: string,
    headers?: HeadersInit
) =>
    await apiRequest(`location/${locationCode}/`, {
        headers,
    });

export const getProfileRequest = async (headers?: HeadersInit) =>
    await apiRequest<Profile>("profile/me", { headers }, assertProfile);
