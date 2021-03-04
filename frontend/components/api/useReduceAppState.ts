import { Reducer, useReducer } from "react";
import { createExpressionWithTypeArguments } from "typescript";
import { AppAction, AppState } from "../../src/model/AppState";
import { assertNever } from "../../src/util/TypeUtil";
import validateReservation from "../../src/util/ValidationUtil";
import createTheme from "../../styles/theme";

export const initialAppState: AppState = {
    initialized: false,
    disableNextUpdate: false,
    subPageTransitionDirection: "right",
    reservationValidation: [],
    currentLocale: "en",
    status: undefined,
    theme: createTheme()
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
                if (action.profile) {
                    return {
                        ...previousState,
                        initialized: true,
                        myProfile: action.profile,
                    };
                }
                return {
                    ...previousState,
                    initialized: true,
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
                    newReservationState.resource?.unit?.uuid;
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
                console.log("updated reservation state", withUpdatedValidation);
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
                    reservation: {
                        ...action.reservation,
                    },
                    reservationRequestTemplate: {
                        ...action.reservationRequestTemplate,
                    },
                };
            case "updateReservation":
                return {
                    ...previousState,
                    reservation: action.reservation,
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
                    currentLocale: action.locale,
                    reservationValidation: validateReservation(
                        previousState.reservationRequest || {},
                        action.locale
                    ),
                };
            case "updateTheme":
                return {
                    ...previousState,
                    theme: {
                        ...previousState.theme,
                        ...action.theme
                    }
                };
            default:
                assertNever(action, `Unhandled state change "${action!.type}"`);
        }
    }, initialAppState);

export default useReduceAppState;
