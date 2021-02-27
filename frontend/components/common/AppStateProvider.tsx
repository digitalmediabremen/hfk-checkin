import React, { FunctionComponent, useContext, useEffect } from "react";
import useDelayedCallback from "../../src/hooks/useDelayedCallback";
import { AppAction, AppState } from "../../src/model/AppState";
import { notEmpty } from "../../src/util/TypeUtil";
import useReduceAppState, { initialAppState } from "../api/useReduceAppState";

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

    const persist = () => {
        console.log("persist localstorage");
        localStorage.setItem(
            "reservation",
            JSON.stringify(appState.reservationRequest)
        );
    };

    const update = useDelayedCallback(() => persist(), 1000);
    useEffect(() => {
        if (notEmpty(appState.reservationRequest)) {
            if (appState.reservationRequest) {
                update();
            }
        }
    }, [appState.reservationRequest]);

    useEffect(() => {
        console.log("read appstate from localstorage");

        dispatch({
            type: "readReservationFromLocalStorage",
        });
    }, []);

    return <Provider value={{ appState, dispatch }}>{children}</Provider>;
};

export const useAppState = () => useContext(appStateContext);
