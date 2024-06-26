import { useEffect, useRef } from "react";
import { usePageVisibility } from "react-page-visibility";
import { useApi } from "../../components/api/ApiHooks";
import { validateReservationRequest } from "../../components/api/ApiService";
import { useAppState } from "../../components/common/AppStateProvider";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import { NewReservationValidation } from "../model/api/NewReservationValidationFixLater";
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
    const { appState, dispatch } = useAppState();
    const isPageVisible = usePageVisibility();

    // useEffect(
    //     () => console.log(appState.reservationValidationObservationCount),
    //     [appState.reservationValidationObservationCount]
    // );

    const handleReservationRequestUpdate = useDelayedCallback(() => {
        if (appState.reservationValidationObservationCount === 0) return;
        if (!isPageVisible) return;
        const reservationBlueprint = appState.reservationRequest;
        if (!reservationBlueprint) return;
        api.validate(reservationBlueprint);
    }, 500);
    useEffect(handleReservationRequestUpdate, [
        appState.reservationRequest,
        appState.reservationValidationObservationCount,
        appState.currentLocale,
        isPageVisible,
    ]);

    function handleValidationUpdate() {
        if (!api.result) return;
        dispatch({
            type: "updateValidation",
            validation: api.result,
        });
    }
    useEffect(handleValidationUpdate, [api.result]);
}
