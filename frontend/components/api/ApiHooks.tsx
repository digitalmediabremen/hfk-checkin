import { useCallback, useEffect, useState } from "react";
import { usePageVisibility } from "react-page-visibility";
import { httpStatuses } from "../../config";
import { Checkin, LastCheckin } from "../../model/Checkin";
import { Location } from "../../model/Location";
import Profile, { ProfileUpdate } from "../../model/Profile";
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

export type UseApiReturnType<RT extends {}> = {
    request: (request: () => Promise<Response<RT>>) => void;
    additionalData: AdditionalResponseData | undefined;
} & (
    | {
          state: "initial";
          error: undefined;
          result: undefined;
      }
    | {
          state: "loading" | "loading";
          error: undefined;
          result: undefined;
      }
    | {
          state: "error";
          error: string;
          result: undefined;
      }
    | {
          state: "success";
          error: undefined;
          result: RT;
      }
);

export interface AdditionalResponseData {
    statusCode?: number;
}

export type ResultModifierFunction<RT extends {}> = (
    res?: RT
) => RT | undefined;

export const useApi = <RT extends {}>(_config?: {
    onlyLocalErrorReport?: boolean;
}): UseApiReturnType<RT> => {
    const { dispatch } = useAppState();
    const [result, setResult] = useState<RT | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [requestInProgress, setRequestInProgress] = useState(false);
    const [additionalData, setAdditionalData] = useState<
        AdditionalResponseData | undefined
    >(undefined);
    const config = _config || {
        onlyLocalErrorReport: false,
    };

    const _deriveRequestState = () => {
        if (requestInProgress) return "loading";
        if (error) return "error";
        if (result) return "success";
        return "initial";
    };

    const _handleError = (error: string, status: number) => {
        setError(error);
        if (!config.onlyLocalErrorReport) {
            dispatch({
                type: "status",
                status: {
                    message: error,
                    isError: true,
                },
            });
        }
    };

    const _handleRequest = <R extends () => Promise<Response<RT>>>(
        request: R
    ) => {
        setError(undefined);
        setAdditionalData(undefined);
        (async () => {
            setRequestInProgress(true);
            const { error, data, status } = await request();
            setRequestInProgress(false);
            setAdditionalData({
                statusCode: status,
            });
            if (error && status <= 500) {
                _handleError(error || `Unknown Error (${status})`, status);
            } else if (!!error && status > 500) {
                throw error;
            } else if (!config.onlyLocalErrorReport) {
                // reset error message
                // but only if request is reporting globally
                dispatch({
                    type: "status",
                    status: undefined,
                });
            }
            setResult(data);
        })();
    };

    return {
        state: _deriveRequestState(),
        result,
        error,
        request: _handleRequest,
        additionalData,
    } as UseApiReturnType<RT>;
};

export const useUpdateProfileFromAppStateAndUpdate = (
    updateOnPageActivation = false
) => {
    const { getProfile, profile, error, loading, success } = useProfile(
        updateOnPageActivation
    );
    const { appState, dispatch } = useAppState();
    const { profile: profileFromAppState } = appState;

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
    };
};

export const useUpdateProfile = () => {
    const { request, state, ...other } = useApi<Profile>();

    return {
        updateProfile: (profile: ProfileUpdate) =>
            request(() => updateProfileRequest(profile)),
        success: state === "success",
        loading: state === "loading",
        ...other,
    };
};

export const useProfile = (updateOnPageActivation = false) => {
    const { request, result: profile, state, ...other } = useApi<Profile>({
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
