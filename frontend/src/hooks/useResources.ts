import { useApi } from "../../components/api/ApiHooks";
import { getResourcesRequest } from "../../components/api/ApiService";
import Resource from "../model/api/Resource";

export default function useResources<P extends boolean>(paginate: P) {
    const { request, ...other } = useApi<Resource[], P>({
        paginate,
    });
    return {
        requestResources: (
            search?: string,
            offset?: number,
            limit?: number
        ) => {
            return request(
                () =>
                    getResourcesRequest({
                        requestParameters: {
                            search,
                            offset,
                            limit,
                        },
                    }),
                offset,
                limit
            );
        },
        ...other,
    };
}