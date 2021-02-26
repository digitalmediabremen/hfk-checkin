import { assert } from "console";
import { Reducer, useCallback, useReducer } from "react";
import { AppAction, AppState } from "../../src/model/AppState";
import validate from "../../src/model/api/NewReservationBlueprint.validator";
import { assertNever, empty } from "../../src/util/TypeUtil";
import validateReservation from "../../src/model/validateReservation";

export const initialAppState: AppState = {
    initialized: false,
    disableNextUpdate: false,
    subPageTransitionDirection: "right",
    reservationValidation: [],
};

const useReduceAppState = () =>
    useReducer<Reducer<AppState, AppAction>>((previousState, action) => {
        switch (action.type) {
            case "readReservationFromLocalStorage":
                const storageItem = localStorage.getItem("reservation");
                if (empty(storageItem))
                    return {
                        ...previousState,
                    };

                try {
                    // todo: fix
                    // parse ones without dates
                    const check = JSON.parse(
                        localStorage.getItem("reservation") || ""
                    ) as unknown;
                    const reservation = validate(check);
                    const reservationWithDates = {
                        ...reservation,
                        start: new Date(
                            (reservation.start as unknown) as string
                        ),
                        end: new Date((reservation.end as unknown) as string),
                    };

                    // now convert dates
                    return {
                        ...previousState,
                        reservation: reservationWithDates,
                        reservationValidation: validateReservation(
                            reservationWithDates
                        ),
                    };
                } catch (e) {
                    console.error(e);
                    // delete invalid reservation item
                    localStorage.removeItem("reservation");
                    return {
                        ...previousState,
                    };
                }
            // assertReservation(maybeReservation);

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
                        isError: false,
                    },
                };
            case "highlightedCheckinWasDisplayed":
                return {
                    ...previousState,
                    highlightCheckinById: undefined,
                };
            case "updateReservation":
                return {
                    ...previousState,
                    reservation: action.reservation,
                    reservationValidation: validateReservation(
                        action.reservation || {}
                    ), 
                };
            case "subPageTransitionDirection":
                const { direction } = action;
                return {
                    ...previousState,
                    subPageTransitionDirection: direction,
                };
            default:
                assertNever(action, `Unhandled state change "${action!.type}"`);
        }
    }, initialAppState);

export default useReduceAppState;
