import { useEffect } from "react";
import { usePageVisibility } from "react-page-visibility";
import { useApi } from "../../components/api/ApiHooks";
import { getKeycardInfoRequest } from "../../components/api/ApiService";
import KeycardInfo from "../model/api/KeycardInfo";

export default function useKeycardInfo() {
    const { request, ...props } = useApi<KeycardInfo>();
    const handleRequest = () => request(() => getKeycardInfoRequest());
    const visible = usePageVisibility();

    useEffect(() => {
        if (!visible) return;
        handleRequest();
    }, [visible]);

    return {
        request: handleRequest,
        ...props,
    };
}
