import { useState } from "react";
import { ProfileUpdate } from "../../model/User";
import { useAppState } from "./AppStateProvider";
import { updateProfileRequest, getProfileRequest, ApiResponse } from "./ApiService";

export const useApi = () => {
    const { dispatch } = useAppState();
    const [result, setResult] = useState<{} | undefined>(undefined);
    const [error, setError] = useState(undefined);
    const loading = !error || !result;

    const handleError = (error: string) => {
        dispatch({
            type: "apiError",
            error: error,
        });
        setError(error);
    };

    const handleRequest = async (request: () => Promise<ApiResponse>) => {
        try {
            const {error, data, status } = await request();
            if (status > 400) handleError(error);
            setResult(data);
        } catch (error) {
            // client error
            handleError("Ein Netzwerkfehler ist aufgetreten.");
        }
    };

    // useEffect(() => { requestImmediatly && handleRequest() }, []);

    return {
        loading,
        result,
        error,
        request: handleRequest,
    };
};

export const useUpdateProfile = () => {
    const { request, loading } = useApi();

    return {
        updateProfile: (profile: ProfileUpdate) =>
            request(() => updateProfileRequest(profile)),
        loading
    };
};

export const useProfile = () => {
    const { request, result: profile, ...other } = useApi();

    return {
        profile,
        getProfile: () => request(() => getProfileRequest()),
        ...other,
    };
};
