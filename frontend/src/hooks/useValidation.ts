import { useCallback, useEffect } from "react";
import { useAppState } from "../../components/common/AppStateProvider";
import { ValidationType } from "../util/ValidationUtil";
import useStatus from "./useStatus";

export default function useValidation() {
    const { appState } = useAppState();
    const { setError } = useStatus();

    const allErrors = appState.reservationValidation
        .filter((r) => r.level === "error")
        .map((r) => r.message)
        .join("\n");
    const hasErrors = appState.reservationValidation.some(
        (r) => r.level === "error"
    );

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

    // show errors to the user
    const userValidate = () => {
        if (hasErrors) {
            setError(allErrors);
            return false;
        }

        return true;
    };

    return {
        hasError: has,
        getError: get,
        allErrors,
        hasErrors,
        userValidate,
    };
}
