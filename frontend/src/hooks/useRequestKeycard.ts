import { useApi } from "../../components/api/ApiHooks";
import { requestKeycardRequest } from "../../components/api/ApiService";
import MyProfile from "../model/api/MyProfile";

export default function useRequestKeycard() {
    const { request, ...props } = useApi<MyProfile>();

    return {
        request: () => request(() => requestKeycardRequest()),
        ...props,
    };
}
