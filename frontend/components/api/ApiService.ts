import Profile, {
    ProfileUpdate,
    assertProfile,
} from "../../src/model/api/Profile";
import * as config from "../../config";
import { NextPageContext } from "next";
import Location from "../../src/model/api/Location";
import { ServerResponse } from "http";
import Checkin, {
    CheckinOrigin,
    LastCheckin,
} from "../../src/model/api/Checkin";
import validateProfile from "../../src/model/api/Profile.validator";
import validateReservation from "../../src/model/api/Reservation.validator";
import validateResource from "../../src/model/api/Resource.validator";

import Reservation from "../../src/model/api/Reservation";
import Resource from "../../src/model/api/Resource";
import { notEmpty } from "../../src/util/TypeUtil";

export type ApiResponse<T> =
    | {
          readonly detail: string;
          readonly results: undefined;
          readonly count: undefined;
      }
    | (T & {
          readonly detail: undefined;
          readonly count: undefined;
          readonly results: undefined;
      })
    | {
          readonly results: T;
          readonly count: number;
          readonly detail: undefined;
      };

export type Response<ResultType extends Record<string, any> = {}> = {
    status: number;
    data?: ResultType;
    error?: string;
    dataCount?: number;
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
        return `${prev}${pre}${notEmpty(value) ? `${key}=${value}` : key}`;
    }, "");
};

export const apiRequest = async <ResultType extends Record<string, any> = {}>(
    endpoint: string,
    requestData: RequestBody,
    responseTypeGuard?: (p: any) => ResultType
): Promise<Response<ResultType>> => {
    const { headers, requestParameters, ...otherRequestData } = requestData;
    const stringifiedRequestParameters = toQueryString(requestParameters);
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
            result: ((await response?.json?.()) as unknown) as
                | ApiResponse<ResultType>
                | undefined,
            status: response.status,
        }))
        .then(({ result, status }) => {
            if (result === undefined)
                throw {
                    status: config.httpStatuses.unprocessable,
                    error: "Response could not be serialized",
                };
            if (status >= 400) {
                if (!result.detail)
                    throw {
                        status: status,
                        error:
                            "Api responded with wrong format.\n Http Error Codes should contain a detail field",
                    };
                throw {
                    status: status,
                    error: result.detail,
                };
            }

            if (notEmpty(result.count) && notEmpty(result.results)) {
                return {
                    data: result.results,
                    status,
                    dataCount: result.count,
                };
            }
            return { data: result, status };
        })
        .then((result) => {
            if (!!responseTypeGuard) {
                console.debug(`Check Model for endpoint "${endpoint}"`);
                responseTypeGuard(result.data);
            }
            return result
        })
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
        active?: undefined;
    }>
) => {
    return await apiRequest<LastCheckin[]>("checkin/", {
        method: "GET",
        ...options,
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
    await apiRequest<Profile>("profile/me/", { headers }, validateProfile);

export const getCheckinRequest = async (
    checkinId: string,
    options?: RequestOptions
) => await apiRequest<LastCheckin>(`checkin/${checkinId}/`, { ...options });

export const getReservationRequest = async (
    reservationId: string,
    options?: RequestOptions
) =>
    await apiRequest<Reservation>(
        `reservation/${reservationId}/`,
        { ...options },
        validateReservation
    );

export const getResourceRequest = async (
    resourceId: string,
    options?: RequestOptions
) =>
    await apiRequest<Resource>(
        `space/${resourceId}/`,
        { ...options },
        validateResource
    );

export const getResourcesRequest = async (options?: RequestOptions) =>
    await apiRequest<Resource[]>(`space/`, { ...options }, (resources) =>
        resources.map((r: any) => validateResource(r))
    );
