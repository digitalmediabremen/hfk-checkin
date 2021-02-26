import { useEffect } from "react";
import { useApi } from "../../components/api/ApiHooks";
import { getResourceRequest } from "../../components/api/ApiService";
import Resource from "../model/api/Resource";

export default function useResource() {
    const { request, ...props } = useApi<Resource>();

    return {
        request: (uuid: string) => request(() => getResourceRequest(uuid)),
        ...props,
    };
}
