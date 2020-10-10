import { useState } from "react";
import Profile, { ProfileUpdate } from "../../model/Profile";
import { useAppState } from "../common/AppStateProvider";
import {
    updateProfileRequest,
    getProfileRequest,
    Response,
    doCheckinRequest,
    getLocationRequest,
    doCheckoutRequest,
} from "./ApiService";
import { Location } from "../../model/Location";

export const useApi = <RT extends unknown>() => {
    const { dispatch } = useAppState();
    const [result, setResult] = useState<RT | undefined>(undefined);
    const [error, setError] = useState(undefined);
    const [requestInProgress, setRequestInProgress] = useState(false);
    const loading = requestInProgress;
    const success = !error && !!result;

    const handleError = (error: string, status: number) => {
        setError(error);
        if (status >= 500) {
            dispatch({
                type: "apiError",
                error: error,
            });
        }
    };

    const handleRequest = async <R extends () => Promise<Response<RT>>>(
        request: R
    ) => {
        setRequestInProgress(true);
        const { error, data, status } = await request();
        setRequestInProgress(false);
        if (status > 400) handleError(error, status);
        setResult(data);
    };

    return {
        loading,
        result,
        success,
        error,
        request: handleRequest,
    };
};

export const useUpdateProfile = () => {
    const { request, ...other } = useApi();

    return {
        updateProfile: (profile: ProfileUpdate) =>
            request(() => updateProfileRequest(profile)),
        ...other,
    };
};

export const useProfile = () => {
    const { request, result: profile, ...other } = useApi<Profile>();

    return {
        profile,
        getProfile: () => request(() => getProfileRequest()),
        ...other,
    };
};

export const useLocation = () => {
    const { request, result, ...other } = useApi<Location>();
    return {
        requestLocation: (locationCode: string) =>
            request(() => getLocationRequest(locationCode)),
        location: result,
        ...other,
    };
};

export const useCheckin = () => {
    const { request, result, ...other } = useApi<{}>();
    return {
        doCheckin: (locationCode: string) =>
            request(() => doCheckinRequest(locationCode)),
        ...other,
    };
};

export const useCheckout = () => {
    const { request, result, ...other } = useApi<{}>();
    return {
        doCheckout: (locationCode: string) =>
            request(() => doCheckoutRequest(locationCode)),
        ...other,
    };
};
