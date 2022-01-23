import { FunctionComponent, useCallback, useEffect } from "react";
import { AlertCircle } from "react-feather";
import { useAppState } from "../../components/common/AppStateProvider";
import {
    ValidationContext,
    ValidationLevel,
    ValidationObject,
    ValidationType,
} from "../model/api/NewReservationValidationFixLater";
import {
    getValidationLevelIcon,
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

    const getHighestValidationLevel = (
        filter?: (o: ValidationObject) => boolean
    ) => {
        return appState.reservationValidation
            .filter(filter || ((a) => a))
            .reduce<ValidationLevel | undefined>((level, validationObject) => {
                if (level === "error" || validationObject.level === "error")
                    return "error";
                if (level === "warning" || validationObject.level === "warning")
                    return "warning";
                if (level === "notice" || validationObject.level === "notice")
                    return "notice";
                return undefined;
            }, undefined);
    };

    const getHighestValidationIcon = (
        filter?: (o: ValidationObject) => boolean
    ) => getValidationLevelIcon(getHighestValidationLevel(filter));

    const has = useCallback(
        (
            type?: ValidationType,
            level?: ValidationLevel,
            context?: ValidationContext
        ) =>
            hasValidationObject(
                appState.reservationValidation,
                type,
                level,
                context
            ),
        [appState.reservationValidation]
    );

    const get = useCallback(
        (
            type?: ValidationType,
            level?: ValidationLevel,
            context?: ValidationContext
        ) =>
            getValidationObject(
                appState.reservationValidation,
                type,
                level,
                context
            ).map((v) => v.detail),
        [appState.reservationValidation]
    );

    return {
        has,
        hasError: has,
        getError: get,
        allErrors,
        hasErrors,
        hasNotices,
        getHighestValidationIcon,
        getHighestValidationLevel,
    };
}
