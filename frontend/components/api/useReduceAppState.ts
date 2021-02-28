import { assert } from "console";
import { Reducer, useCallback, useReducer } from "react";
import { AppAction, AppState } from "../../src/model/AppState";
import validate from "../../src/model/api/NewReservationBlueprint.validator";
import { assertNever, empty } from "../../src/util/TypeUtil";
import validateReservation from "../../src/model/validateReservation";
import NewReservationBlueprint from "../../src/model/api/NewReservationBlueprint";
import ReservationPage from "../../pages/request/[reservationId]";

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
                    const lsi = localStorage.getItem("reservation") || "";
                    const check = JSON.parse(lsi) as unknown;
                    const reservation = validate(check);
                    // @ts-ignore
                    const parseAgainWithDates = (JSON.parseWithDate(
                        lsi
                    ) as unknown) as NewReservationBlueprint;

                    // now convert dates
                    return {
                        ...previousState,
                        reservationRequest: parseAgainWithDates,
                        reservationValidation: validateReservation(
                            parseAgainWithDates
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
            case "updateReservation":
                const newk = {
                    ...action.reservation,
                    resource_uuid: action.reservation?.resource?.uuid,
                };
                return {
                    ...previousState,
                    reservationRequest: newk,
                    reservationValidation: validateReservation(newk || {}),
                };
            case "reservationSuccessful":
                return {
                    ...previousState,
                    reservation: action.reservation,
                    reservationRequestTemplate:
                        action.reservationRequestTemplate,
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
