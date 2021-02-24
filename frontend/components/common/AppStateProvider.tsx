import React, { FunctionComponent, useContext, useEffect } from "react";
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
    useEffect(() => {
        if (notEmpty(appState.reservation)) {
            localStorage.setItem(
                "reservation",
                JSON.stringify(appState.reservation)
            );
        }
    }, [appState.reservation]);

    useEffect(() => {
        console.log("read appstate from localstorage");

        dispatch({
            type: "readReservationFromLocalStorage",
        });
    }, []);

    return <Provider value={{ appState, dispatch }}>{children}</Provider>;
};

export const useAppState = () => useContext(appStateContext);
