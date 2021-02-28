import { useRouter } from "next/router";
import { useEffect } from "react";
import { useApi } from "../../components/api/ApiHooks";
import { updateReservationRequest } from "../../components/api/ApiService";
import { useAppState } from "../../components/common/AppStateProvider";
import { appUrls } from "../../config";
import NewReservation from "../model/api/NewReservation";
import validate from "../model/api/NewReservation.validator";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import Reservation from "../model/api/Reservation";
import { useReservation } from "./useReservationState";
import useStatus from "./useStatus";
import useValidation from "./useValidation";

export default function useSubmitReservation() {
    const api = useApi<Reservation>();
    const { reservation, validateModel } = useReservation();
    const { allErrors, hasErrors } = useValidation();
    const { appState, dispatch } = useAppState();
    const { setError } = useStatus();
    const router = useRouter();

    const submitReservationRequest = (r: NewReservation) =>
        api.request(() => updateReservationRequest(r));

    useEffect(() => {
        if (api.state === "success") {
            const reservationObject = api.result;
            const { identifier } = reservationObject;
            const validReservation = validateModel();
            dispatch({
                type: "reservationSuccessful",
                reservation: reservationObject,
                reservationRequestTemplate: validReservation,
            });
            router.push(...appUrls.reservation(identifier));
        }
    }, [api.state, appState, reservation]);

    const submit = () => {
        if (hasErrors) {
            console.error("hasErrors");
            setError(allErrors);
            return;
        }
        const validReservation = validateModel();
        submitReservationRequest(validReservation);
    };

    return submit;
}
