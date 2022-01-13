import { Reducer, useReducer } from "react";
import { createExpressionWithTypeArguments } from "typescript";
import { AppAction, AppState } from "../../src/model/AppState";
import { assertNever, empty, notEmpty } from "../../src/util/TypeUtil";
import validateReservation from "../../src/util/ReservationValidationUtil";
import createTheme from "../../styles/theme";
import Locale from "../../src/model/api/Locale";
import { getTypeSafeLocale } from "../../src/util/LocaleUtil";

export const initialAppState: AppState = {
    initialized: false,
    disableNextUpdate: false,
    subPageTransitionDirection: "right",
    reservationValidation: [],
    currentLocale: getTypeSafeLocale(),
    status: undefined,
    theme: createTheme(false, false, "light"),
    reservationValidationObservationCount: 0
};

const useReduceAppState = () =>
    useReducer<Reducer<AppState, AppAction>>((previousState, action) => {
        switch (action.type) {
            case "status":
                return {
                    ...previousState,
                    status: action.status,
                };
            case "profile":
                return {
                    ...previousState,
                    initialized: true,
                    currentLocale:
                        action.profile?.preferred_language ||
                        previousState.currentLocale,
                    myProfile: action.profile,
                };

            case "enableNextUpdate":
                return {
                    ...previousState,
                    disableNextUpdate: false,
                };
            case "disableNextUpdate":
                return {
                    ...previousState,
                    disableNextUpdate: true,
                };
            case "checkout":
                return {
                    ...previousState,
                    highlightCheckinById: action.highlightCheckinById,
                    status: {
                        message: action.message,
                        isError: false,
                    },
                };
            case "highlightedCheckinWasDisplayed":
                return {
                    ...previousState,
                    highlightCheckinById: undefined,
                };
            case "updateReservationRequest":
                if (action.reservation === undefined) {
                    console.log("reset reservation state");
                    return {
                        ...previousState,
                        reservationRequest: undefined,
                        reservationValidation: validateReservation(
                            {},
                            previousState.currentLocale
                        ),
                    };
                }

                const newReservationState = {
                    ...previousState.reservationRequest,
                    ...action.reservation,
                };
                const selectedUnitId =
                    newReservationState.selectedUnitId ||
                    newReservationState.resource?.unit?.slug;
                const resource_uuid = newReservationState.resource?.uuid;

                const withUpdatedComputeds = {
                    ...newReservationState,
                    resource_uuid,
                    selectedUnitId,
                };
                const withUpdatedValidation = {
                    ...previousState,
                    reservationRequest: withUpdatedComputeds,
                    reservationValidation: validateReservation(
                        withUpdatedComputeds,
                        previousState.currentLocale
                    ),
                };
                // console.log("updated reservation state", withUpdatedValidation);
                return withUpdatedValidation;
            case "updateReservationRequestTemplate":
                return {
                    ...previousState,
                    reservationRequestTemplate: action.reservation,
                };
            case "reservationSuccessful":
                return {
                    ...previousState,
                    showReservationSuccessful: true,
                    reservationRequestTemplate: {
                        ...action.reservationRequestTemplate,
                        templateId: action.reservationId,
                    },
                };
            case "hideReservationSuccessful":
                return {
                    ...previousState,
                    showReservationSuccessful: false,
                };
            case "subPageTransitionDirection":
                const { direction } = action;
                return {
                    ...previousState,
                    subPageTransitionDirection: direction,
                };
            case "updateLocale":
                return {
                    ...previousState,
                    currentLocale: action.locale as unknown as Locale,
                    reservationValidation: validateReservation(
                        previousState.reservationRequest || {},
                        action.locale
                    ),
                };
            case "updateTheme":
                return {
                    ...previousState,
                    theme: createTheme(
                        notEmpty(action.isDesktop)
                            ? action.isDesktop
                            : previousState.theme.isDesktop,
                        notEmpty(action.isPWA)
                            ? action.isPWA
                            : previousState.theme.isPWA,
                        notEmpty(action.colorScheme)
                            ? action.colorScheme
                            : previousState.theme.colorScheme
                    ),
                };
            case "overwriteColorScheme":
                return {
                    ...previousState,
                    overwriteColorScheme: action.colorScheme,
                };
            case "observeValidation":
                return {
                    ...previousState,
                    reservationValidationObservationCount:
                        previousState.reservationValidationObservationCount + 1,
                };
            case "unobserveValidation":
                return {
                    ...previousState,
                    reservationValidationObservationCount:
                        previousState.reservationValidationObservationCount - 1,
                };
            default:
                assertNever(
                    action,
                    `Unhandled state change "${
                        (action as unknown as AppAction).type
                    }"`
                );
        }
    }, initialAppState);

export default useReduceAppState;
