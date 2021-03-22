import { useCallback, useEffect, useState } from "react";
import { usePageVisibility } from "react-page-visibility";
import { httpStatuses } from "../../config";
import Checkin, { LastCheckin } from "../../src/model/api/Checkin";
import Location from "../../src/model/api/Location";
import MyProfile, { ProfileUpdate } from "../../src/model/api/MyProfile";
import { insertIf } from "../../src/util/ReservationUtil";
import { empty, notEmpty } from "../../src/util/TypeUtil";
import { useAppState } from "../common/AppStateProvider";
import {
    doCheckinRequest,
    doCheckoutRequest,
    getCheckinRequest,
    getCheckinsRequest,
    getLocationRequest,
    getProfileRequest,
    Response,
    updateProfileRequest,
} from "./ApiService";

type PaginationArrayType<T, P extends boolean> = P extends true
    ? T extends Array<infer K>
        ? Array<K | null>
        : T
    : T;

export type UseApiReturnType<RT, HasPagination extends boolean = false> = {
    request: HasPagination extends true
        ? (
              request: () => Promise<Response<RT>>,
              offset?: number,
              limit?: number
          ) => Promise<RT | undefined>
        : (request: () => Promise<Response<RT>>) => Promise<RT | undefined>;
    reset: () => void;
} & (
    | {
          state: "initial";
          error: undefined;
          result: undefined;
          additionalData: undefined;
      }
    | {
          state: "loading";
          error: undefined;
          additionalData: undefined;
          result: PaginationArrayType<RT, HasPagination> | undefined;
      }
    | {
          state: "error";
          error: string;
          result: undefined;
          additionalData: AdditionalResponseData;
      }
    | {
          state: "success";
          error: undefined;
          result: PaginationArrayType<RT, HasPagination>;
          additionalData: AdditionalResponseData;
      }
);

export interface AdditionalResponseData {
    statusCode: number;
    notVerified: boolean;
    notAuthorized: boolean;
    notFound: boolean;
    dataCount?: number;
}

type ApiConfig<b extends boolean | undefined> = {
    onlyLocalErrorReport?: boolean;
    paginate?: b;
};

export type ResultModifierFunction<RT extends {}> = (
    res?: RT
) => RT | undefined;

export const useApi = <RT, Paginate extends boolean = false>(
    _config?: ApiConfig<Paginate>
): UseApiReturnType<RT, Paginate> => {
    const config = _config || {
        onlyLocalErrorReport: false,
        paginate: false,
    };
    const { appState, dispatch } = useAppState();
    const [result, _setResult] = useState<
        PaginationArrayType<RT, Paginate> | undefined
    >(undefined);
    const setResult = (data?: RT, offset?: number, limit?: number) => {
        if (
            config.paginate &&
            notEmpty(offset) &&
            notEmpty(limit) &&
            Array.isArray(data) &&
            Array.isArray(result)
        ) {
            // check if anythin might be empty
            for (let i = 0; i < offset; i++) {
                if (empty(result[i])) result[i] = null;
            }
            // fill new data
            for (let i = 0; i < limit; i++) {
                result[i + offset] = data[i];
            }
            _setResult([...result] as PaginationArrayType<RT, Paginate>);
        } else {
            _setResult(data as PaginationArrayType<RT, Paginate>);
        }
    };
    const [error, setError] = useState<string | undefined>(undefined);
    const [requestInProgress, setRequestInProgress] = useState(false);
    const [additionalData, setAdditionalData] = useState<
        AdditionalResponseData | undefined
    >(undefined);

    const _deriveRequestState = () => {
        if (requestInProgress) return "loading";
        if (error) return "error";
        if (result) return "success";
        return "initial";
    };

    const _handleError = (error: string, status: number) => {
        setError(error);

        const exludedStatuses = [
            ...insertIf(
                [httpStatuses.notAuthorized],
                !!config.onlyLocalErrorReport
            )
        ] as number[];

        if (!exludedStatuses.includes(status)) {
            dispatch({
                type: "status",
                status: {
                    message: error,
                    isError: true,
                },
            });
        }
    };

    const _handleRequest = async <R extends () => Promise<Response<RT>>>(
        request: R,
        offset?: number,
        limit?: number
    ) => {
        setError(undefined);
        // setAdditionalData(undefined);
        setRequestInProgress(true);
        const { error, data, status, dataCount } = await request();
        setRequestInProgress(false);
        setAdditionalData({
            statusCode: status,
            notAuthorized: status === httpStatuses.notAuthorized,
            notVerified: status === httpStatuses.notVerified,
            notFound: status === httpStatuses.notFound,
            dataCount,
        });
        if (error && status <= 500) {
            _handleError(error || `Unknown Error (${status})`, status);
        } else if (!!error && status > 500) {
            throw error;
        } else if (!config.onlyLocalErrorReport) {
            // reset error message
            // but only if request is reporting globally
            if (appState.status?.isError) {
                dispatch({
                    type: "status",
                    status: undefined,
                });
            }
        }
        if (data) {
            setResult(data, offset, limit);
            return data;
        }
        return undefined;
    };

    return {
        state: _deriveRequestState(),
        result,
        error,
        request: _handleRequest,
        additionalData,
        reset: () => {
            setResult(undefined);
        },
    } as UseApiReturnType<RT, Paginate>;
};

export const useUpdateProfileFromAppStateAndUpdate = (
    updateOnPageActivation = false
) => {
    const {
        getProfile,
        profile,
        error,
        loading,
        success,
        additionalData,
    } = useProfile(updateOnPageActivation);
    const { appState, dispatch } = useAppState();
    const { myProfile: profileFromAppState } = appState;

    useEffect(() => {
        if (!appState.disableNextUpdate) {
            getProfile();
        } else {
            dispatch({
                type: "enableNextUpdate",
            });
        }
    }, []);

    useEffect(() => {
        (success || error) &&
            dispatch({
                type: "profile",
                profile,
            });
    }, [profile, error]);

    return {
        loading,
        success,
        error,
        profile: profileFromAppState,
        additionalData,
    };
};

export const useUpdateProfile = () => {
    const { request, state, ...other } = useApi<MyProfile>();

    return {
        updateProfile: (profile: ProfileUpdate) =>
            request(() => updateProfileRequest(profile)),
        success: state === "success",
        loading: state === "loading",
        ...other,
    };
};

export const useProfile = (updateOnPageActivation = false) => {
    const { request, result: profile, state, ...other } = useApi<MyProfile>({
        onlyLocalErrorReport: true,
    });

    const visible = usePageVisibility();
    useEffect(() => {
        // console.log("should update profile", state, visible, update)

        if (
            updateOnPageActivation &&
            visible &&
            state !== "initial" &&
            state !== "loading"
        ) {
            // console.log("update profile")
            request(() => getProfileRequest());
        }
    }, [visible]);

    return {
        profile,
        getProfile: () => request(() => getProfileRequest()),
        success: state === "success",
        loading: state === "loading",
        ...other,
    };
};

export const useLocation = () => {
    const { request, result, state, ...other } = useApi<Location>();
    return {
        requestLocation: (locationCode: string) =>
            request(() => getLocationRequest(locationCode)),
        location: result,
        success: state === "success",
        loading: state === "loading",
        ...other,
    };
};

export const useCheckin = (checkinId?: string) => {
    const { request, ...data } = useApi<LastCheckin>();
    useEffect(() => {
        if (checkinId) request(() => getCheckinRequest(checkinId));
    }, [checkinId]);
    return {
        requestCheckin: (otherCheckinId: string) =>
            request(() => getCheckinRequest(otherCheckinId)),
        data,
    };
};

export const useActiveCheckins = (
    resultModifier?: ResultModifierFunction<LastCheckin[]>
) => {
    const { request, ...data } = useApi<LastCheckin[]>();
    const updateOnPageActivation = true;
    const r = useCallback(
        () =>
            request(() =>
                getCheckinsRequest({
                    requestParameters: {
                        active: undefined,
                    },
                })
            ),
        [request]
    );

    useEffect(() => {
        r();
    }, []);

    const visible = usePageVisibility();
    useEffect(() => {
        if (
            updateOnPageActivation &&
            visible &&
            data.state !== "initial" &&
            data.state !== "loading"
        ) {
            r();
        }
    }, [visible]);

    return {
        data: {
            ...data,
            result: resultModifier?.(data.result),
        } as UseApiReturnType<LastCheckin[]>,
    };
};

export const useDoCheckin = (locationCode?: string) => {
    const { request, additionalData, ...data } = useApi<Checkin>();
    const { dispatch } = useAppState();

    useEffect(() => {
        if (locationCode) request(() => doCheckinRequest(locationCode));
    }, [locationCode]);

    useEffect(() => {
        if (data.state === "success") {
            dispatch({
                type: "profile",
                profile: data.result.profile,
            });
        }
    }, [data.state]);

    return {
        doCheckin: (otherLocationCode: string) =>
            request(() => doCheckinRequest(otherLocationCode)),
        alreadyCheckedIn:
            additionalData?.statusCode === httpStatuses.alreadyCheckedIn,
        notVerified: additionalData?.statusCode === httpStatuses.notVerified,
        data,
    };
};

export const useDoCheckout = () => {
    const { request, state, result, ...other } = useApi<Checkin>();
    const { dispatch } = useAppState();

    useEffect(() => {
        if (state === "success") {
            dispatch({
                type: "profile",
                profile: result?.profile,
            });
        }
    }, [state]);

    return {
        doCheckout: (locationCode: string) =>
            request(() => doCheckoutRequest(locationCode)),
        success: state === "success",
        loading: state === "loading",
        ...other,
    };
};
