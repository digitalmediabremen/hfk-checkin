import { useState } from "react";
import Profile, { ProfileUpdate } from "../../model/Profile";
import { useAppState } from "./AppStateProvider";
import { updateProfileRequest, getProfileRequest, Response } from "./ApiService";

export const useApi = <RT extends unknown>() => {
    const { dispatch } = useAppState();
    const [result, setResult] = useState<RT | undefined>(undefined);
    const [error, setError] = useState(undefined);
    const loading = !error || !result;
    const success = !error && !!result;

    const handleError = (error: string) => {
        dispatch({
            type: "apiError",
            error: error,
        });
        setError(error);
    };

    const handleRequest = async <R extends () => Promise<Response<RT>>>(request: R) => {
        const {error, data, status } = await request();
        if (status > 400) handleError(error);
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
        ...other
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
