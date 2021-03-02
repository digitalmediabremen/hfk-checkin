import { useEffect } from "react";
import { useApi } from "../../components/api/ApiHooks";
import {
    getUnitsRequest
} from "../../components/api/ApiService";
import Unit from "../model/api/Unit";

export default function useUnits() {
    const { request, ...other } = useApi<Unit[], false>();

    return {
        requestUnits: () => request(() => getUnitsRequest()),
        ...other,
    };
}
