import { useEffect, useRef } from "react";
import { useApi } from "../../components/api/ApiHooks";
import { validateReservationRequest } from "../../components/api/ApiService";
import { useAppState } from "../../components/common/AppStateProvider";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import NewReservationValidation from "../model/api/NewReservationValidation";
import useStatus from "./useStatus";

export function useReservationValidation() {
    const { request, ...other } = useApi<NewReservationValidation>();

    function handleValidation(reservation: NewReservationBlueprint) {
        return request(() => validateReservationRequest(reservation));
    }

    return {
        ...other,
        validate: handleValidation,
    };
}

export default function useValidateReservationOnChange() {
    const api = useReservationValidation();
    const { appState } = useAppState();
    const { empty, setError } = useStatus();
    const mounted = useRef(false)


    useEffect(handleReservationRequestUpdate, [appState.reservationRequest]);
    function handleReservationRequestUpdate() {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        const reservationBlueprint = appState.reservationRequest;
        if (!reservationBlueprint) return;
        console.log("validate", reservationBlueprint)
        api.validate(reservationBlueprint);
    }

    useEffect(handleValidationUpdate, [api.state]);
    function handleValidationUpdate() {
        if (api.state !== "success") return;
        console.log("validation result", api.result)
    }
}
