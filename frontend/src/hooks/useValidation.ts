import { useCallback, useEffect } from "react";
import { useAppState } from "../../components/common/AppStateProvider";
import {
    ValidationLevel,
    ValidationType,
} from "../model/api/NewReservationValidationFixLater";
import {
    getValidationObject,
    hasValidationObject,
} from "../util/ReservationValidationUtil";
import useStatus from "./useStatus";

export default function useValidation() {
    const { appState, dispatch } = useAppState();
    const { setError } = useStatus();

    useEffect(() => {
        dispatch({
            type: "observeValidation",
        });

        return () => {
            dispatch({
                type: "unobserveValidation",
            });
        };
    }, []);

    const allErrors = appState.reservationValidation
        .filter((r) => r.level === "error")
        .map((r) => r.detail)
        .join("\n\n");
    const hasErrors = appState.reservationValidation.some(
        (r) => r.level === "error"
    );

    const hasNotices = appState.reservationValidation.some(
        (r) => r.level === "error" || r.level === "notice"
    );

    const has = useCallback(
        (type: ValidationType, level?: ValidationLevel) =>
            hasValidationObject(appState.reservationValidation, type, level),
        [appState.reservationValidation]
    );

    const get = useCallback(
        (type: ValidationType, level?: ValidationLevel) =>
            getValidationObject(
                appState.reservationValidation,
                type,
                level
            ).map((v) => v.detail),
        [appState.reservationValidation]
    );

    return {
        has,
        hasError: (type: ValidationType) => has(type, "error"),
        getError: get,
        allErrors,
        hasErrors,
        hasNotices,
    };
}
