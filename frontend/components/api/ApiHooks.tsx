import { useEffect, useState } from "react";
import { Location } from "../../model/Location";
import Profile, { ProfileUpdate } from "../../model/Profile";
import { useAppState } from "../common/AppStateProvider";
import {
    doCheckinRequest,
    doCheckoutRequest,
    getLocationRequest,
    getProfileRequest,
    Response,
    updateProfileRequest,
    getCheckinRequest,
} from "./ApiService";
import { Checkin, LastCheckin } from "../../model/Checkin";
import { config } from "process";
import { httpStatuses } from "../../config";
import { usePageVisibility } from "react-page-visibility";

type UseApiReturnType<RT extends {}> = {
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

interface AdditionalResponseData {
    statusCode?: number;
}

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

export const useUpdateProfileFromAppStateAndUpdate = (update = false) => {
    const { getProfile, profile, error, loading, success } = useProfile(update);
    const { appState, dispatch } = useAppState();
    const { profile: profileFromAppState } = appState;

    useEffect(() => {
        getProfile();
    }, []);

    useEffect(() => {
        (success || error) && dispatch({
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

export const useProfile = (update = false) => {
    const { request, result: profile, state, ...other } = useApi<Profile>({
        onlyLocalErrorReport: true,
    });

    const visible = usePageVisibility();
    useEffect(() => {
        // console.log("should update profile", state, visible, update)

        if (update && visible && state !== "initial" && state !== "loading") {
            // console.log("update profile")
            request(() => getProfileRequest())
        }  
    }, [visible])

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

export const useDoCheckin = (locationCode?: string) => {
    const { request, additionalData, ...data } = useApi<Checkin>();

    useEffect(() => {
        if (locationCode) request(() => doCheckinRequest(locationCode));
    }, [locationCode]);
    return {
        doCheckin: (otherLocationCode: string) =>
            request(() => doCheckinRequest(otherLocationCode)),
        alreadyCheckedIn:
            additionalData?.statusCode === httpStatuses.alreadyCheckedIn,
        data,
    };
};

export const useDoCheckout = () => {
    const { request, state, result, ...other } = useApi<{}>();
    return {
        doCheckout: (locationCode: string) =>
            request(() => doCheckoutRequest(locationCode)),
        success: state === "success",
        loading: state === "loading",
        ...other,
    };
};
