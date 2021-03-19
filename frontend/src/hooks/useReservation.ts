import { useEffect, useLayoutEffect, useState } from "react";
import { useApi } from "../../components/api/ApiHooks";
import {
    cancelReservationRequest,
    getReservationRequest,
} from "../../components/api/ApiService";
import { useAppState } from "../../components/common/AppStateProvider";
import Reservation from "../model/api/Reservation";

export default function useReservation(reservationId?: string) {
    const { appState, dispatch } = useAppState();
    const api = useApi<Reservation>();

    const { showReservationSuccessful } = appState;
    const [reservationSuccess, setReservationSuccess] = useState(false);

    useEffect(() => {
        if (showReservationSuccessful) {
            setReservationSuccess(true);
            dispatch({
                type: "hideReservationSuccessful",
            });
        }
    }, [showReservationSuccessful]);

    useEffect(() => {
        if (reservationId) {
            api.request(() => getReservationRequest(reservationId));
        }
    }, [reservationId]);

    const cancelReservation = () => {
        if (!reservationId) return;
        return api.request(() => cancelReservationRequest(reservationId));
    };

    return {
        reservationSuccess,
        notFound: api.additionalData?.notFound,
        cancel: cancelReservation,
        ...api,
    };
}
