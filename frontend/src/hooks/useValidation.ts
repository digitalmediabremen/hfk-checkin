import { useCallback, useEffect } from "react";
import { useAppState } from "../../components/common/AppStateProvider";
import {
    getValidationObject,
    hasValidationObject,
    ValidationLevel,
    ValidationType,
} from "../util/ReservationValidationUtil";
import useStatus from "./useStatus";

export default function useValidation() {
    const { appState } = useAppState();
    const { setError } = useStatus();

    const allErrors = appState.reservationValidation
        .filter((r) => r.level === "error")
        .map((r) => r.message)
        .join("\n\n");
    const hasErrors = appState.reservationValidation.some(
        (r) => r.level === "error"
    );

    const has = useCallback(
        (type: ValidationType, level?: ValidationLevel) =>
            hasValidationObject(appState.reservationValidation, type, level),
        [appState]
    );

    const get = useCallback(
        (type: ValidationType, level?: ValidationLevel) =>
            getValidationObject(
                appState.reservationValidation,
                type,
                level
            ).map((v) => v.message),
        [appState]
    );

    // show errors to the user
    const userValidate = () => {
        if (hasErrors) {
            setError(allErrors);
            return false;
        }

        return true;
    };

    return {
        hasError: (type: ValidationType) => has(type, "error"),
        getError: get,
        allErrors,
        hasErrors,
        userValidate,
    };
}
