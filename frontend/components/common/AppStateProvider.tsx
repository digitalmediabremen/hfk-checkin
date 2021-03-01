import React, { FunctionComponent, useContext, useEffect } from "react";
import useDelayedCallback from "../../src/hooks/useDelayedCallback";
import useLocalStorage from "../../src/hooks/useLocalStorage";
import useSafe from "../../src/hooks/useLocalStorage";
import validate from "../../src/model/api/NewReservationBlueprint.validator";
import validateRequestTemplate from "../../src/model/api/NewReservation.validator";

import { AppAction, AppState } from "../../src/model/AppState";
import { notEmpty } from "../../src/util/TypeUtil";
import useReduceAppState, { initialAppState } from "../api/useReduceAppState";
import useSubPage from "../api/useSubPage";

const appStateContext = React.createContext<{
    appState: AppState;
    dispatch: React.Dispatch<AppAction>;
}>({
    appState: initialAppState,
    dispatch: () => undefined,
});

const { Provider } = appStateContext;

export const AppStateProvider: FunctionComponent<{}> = ({ children }) => {
    const [appState, dispatch] = useReduceAppState();

    useLocalStorage(
        "rr",
        appState.reservationRequest,
        validate,
        (r) =>
            dispatch({
                type: "updateReservationRequest",
                reservation: r,
            })
    );

    useLocalStorage(
        "rrt",
        appState.reservationRequestTemplate,
        validateRequestTemplate,
        (r) =>
            dispatch({
                type: "updateReservationRequestTemplate",
                reservation: r,
            })
    );

    return <Provider value={{ appState, dispatch }}>{children}</Provider>;
};

export const useAppState = () => useContext(appStateContext);
