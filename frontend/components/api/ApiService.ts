import Profile, { ProfileUpdate } from "../../model/User";
import * as config from "../../config";

export type ApiResponse<ResultType extends {} = {}> = {
          error: string;
          detail: string;
    }

export type Response<ResultType extends unknown = {}> =
    | {
          error: string;
          status: number;
          data?: never;
      }
    | {
        error?: never;
        status: number;
        data: ResultType;
      };

export const apiRequest = async <ResultType extends unknown = {}>(
    endpoint: string,
    requestData?: RequestInit
): Promise<Response<ResultType>> => {
    try {

        const request = await fetch(`${config.apiUrl}/${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            ...requestData,
        });
        const response = (request.json() as unknown) as ApiResponse<ResultType>;
        if (!!response.error)  {
            return {
                error: response.detail,
                status: request.status
            }
        }

        return {
            status: request.status,
            data: response as ResultType
        }
    } catch (error) {
        console.error("network error", error.message);
        // client error
        return {
            error: error.message,
            status: 600,
        };
    }
};

export const updateProfileRequest = async (profile: ProfileUpdate) =>
    await apiRequest("profile", {
        method: "POST",
        body: JSON.stringify(profile),
    });

export const getProfileRequest = async () =>
    await apiRequest<Profile>("profile/me");
