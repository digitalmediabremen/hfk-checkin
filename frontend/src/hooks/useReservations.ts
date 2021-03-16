import { RequestOptions } from "https";
import { useEffect } from "react";
import { usePageVisibility } from "react-page-visibility";
import { useApi } from "../../components/api/ApiHooks";
import { getReservationsRequest } from "../../components/api/ApiService";
import Reservation from "../model/api/Reservation";

export default function useReservations() {
    const { request, state, ...other} = useApi<Reservation[]>();

    const visible = usePageVisibility();
    useEffect(() => {
        // console.log("should update profile", state, visible, update)
        if (
            visible &&
            state !== "initial" &&
            state !== "loading"
        ) {
            // console.log("update profile")
            request(() => getReservationsRequest());
        }
    }, [visible]);

    return {
        request: () =>
            request(() => getReservationsRequest()),
        state,
        ...other,
    };
}
