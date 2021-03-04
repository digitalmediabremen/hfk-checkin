import { resourceUsage } from "process";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { setConstantValue } from "typescript";
import { useApi } from "../../components/api/ApiHooks";
import { getReservationRequest } from "../../components/api/ApiService";
import { useAppState } from "../../components/common/AppStateProvider";
import Reservation from "../model/api/Reservation";

export default function useReservation(reservationId?: string) {
    const { appState, dispatch } = useAppState();
    const reservationFromAppstate = appState.reservation;
    const api = useApi<Reservation>();
    const [useFromAppstate, setUseFromAppstate] = useState(
        !!reservationFromAppstate
    );
    const { showReservationSuccessful } = appState;å
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
        if (!api.result) return;
        dispatch({
            type: "updateReservation",
            reservation: api.result,
        });
    }, [api.result]);

    useLayoutEffect(() => {
        if (reservationId) {
            if (
                reservationFromAppstate &&
                (reservationFromAppstate.identifier === reservationId ||
                    reservationFromAppstate.uuid === reservationId)
            ) {
                setUseFromAppstate(true);
            } else {
                api.request(() => getReservationRequest(reservationId));
                setUseFromAppstate(false);
            }
        }
    }, [reservationFromAppstate, reservationId]);

    return {
        reservationSuccess,
        reservation: useFromAppstate ? reservationFromAppstate : api.result,
        loading: useFromAppstate ? false : api.state === "loading",
        notFound: api.additionalData?.notFound,
        ...api,
    };
}
