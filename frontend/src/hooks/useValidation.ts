import { useCallback } from "react";
import { useAppState } from "../../components/common/AppStateProvider";
import { ValidationType } from "../model/validateReservation";

export default function useValidation() {
    const { appState } = useAppState();
    appState.reservationValidation;

    const has = useCallback(
        (type: ValidationType) =>
            appState.reservationValidation.some((r) => r.type === type),
        [appState]
    );

    const get = useCallback(
        (type: ValidationType) =>
            appState.reservationValidation
                .filter((r) => r.type === type)
                .map((v) => v.message),
        [appState]
    );

    return {
        hasError: has,
        getErrors: get
    }
}
