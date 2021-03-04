import { RequestOptions } from "https";
import { useApi } from "../../components/api/ApiHooks";
import { getReservationsRequest } from "../../components/api/ApiService";
import Reservation from "../model/api/Reservation";

export default function useReservations() {
    const { request, ...other } = useApi<Reservation[]>();

    return {
        request: () =>
            request(() => getReservationsRequest({
                requestParameters: {
                }
            })),
        ...other,
    };
}
