import { useCallback } from "react";
import { useAppState } from "../../components/common/AppStateProvider";
import { ValidationType } from "../model/validateReservation";

export default function useValidation() {
    const { appState } = useAppState();

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
        getError: get,
        allErrors: appState.reservationValidation.filter(r => r.level === "error").map(r => r.message).join(","),
        hasErrors: appState.reservationValidation.some(r => r.level === "error")
    }
}
