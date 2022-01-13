import { useEffect, useRef } from "react";
import { useApi } from "../../components/api/ApiHooks";
import { validateReservationRequest } from "../../components/api/ApiService";
import { useAppState } from "../../components/common/AppStateProvider";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import NewReservationValidation from "../model/api/NewReservationValidationFixLater";
import useDelayedCallback from "./useDelayedCallback";
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

    useEffect(
        () => console.log(appState.reservationValidationObservationCount),
        [appState.reservationValidationObservationCount]
    );

    const handleReservationRequestUpdate = useDelayedCallback(() => {
        if (appState.reservationValidationObservationCount === 0) return;
        const reservationBlueprint = appState.reservationRequest;
        if (!reservationBlueprint) return;
        console.log(
            "validate",
            reservationBlueprint,
            appState.reservationValidation
        );
        api.validate(reservationBlueprint);
    }, 1000);
    useEffect(handleReservationRequestUpdate, [
        appState.reservationRequest,
        appState.reservationValidationObservationCount,
    ]);

    function handleValidationUpdate() {
        // if (api.state !== "error") return;
        console.log("validation result", api.result);
    }
    useEffect(handleValidationUpdate, [api.state]);
}
