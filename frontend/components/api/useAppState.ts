import { assert } from "console";
import { Reducer, useReducer } from "react";
import { AppAction, AppState } from "../../src/model/AppState";
import validate from "../../src/model/api/NewReservationBlueprint.validator";

export const initialAppState: AppState = {
    initialized: false,
    disableNextUpdate: false,
    reservation: undefined,
    reservationTemplate: undefined
};

const useReduceAppState = () => useReducer<Reducer<AppState, AppAction>>(
    (previousState, action) => {
        switch (action.type) {
            case "readReservationFromLocalStorage":
                // @ts-ignore
                const maybeReservation = JSON.parseWithDate(localStorage.getItem("reservation")) as unknown;
                const reservation = validate(maybeReservation);
                // assertReservation(maybeReservation);
                return {
                    ...previousState,
                    reservation: reservation
                }
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
                        profile: action.profile,
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
                        isError: false
                    }
                }
            case "highlightedCheckinWasDisplayed":
                return {
                    ...previousState,
                    highlightCheckinById: undefined
                }
            default:
                throw new Error();
        }
    },
    initialAppState
);

export default useReduceAppState;