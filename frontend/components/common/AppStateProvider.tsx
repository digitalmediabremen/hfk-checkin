import React, { SFC, useContext, useReducer, Reducer, useEffect } from "react";
import { AppAction, AppState } from "../../src/model/AppState";

import "json.date-extensions"
import { assert } from "console";
import useReduceAppState, { initialAppState } from "../api/useAppState";


const appStateContext = React.createContext<{
    appState: AppState;
    dispatch: React.Dispatch<AppAction>;
}>({
    appState: initialAppState,
    dispatch: () => undefined,
});

const { Provider, Consumer } = appStateContext;

export const AppStateProvider: SFC<{}> = ({ children }) => {
    const [state, dispatch] = useReduceAppState();

    useEffect(() => {
        localStorage.setItem("reservation", JSON.stringify(state));
      }, [state]);
    
    useEffect(() => {
        dispatch({
            type: "readReservationFromLocalStorage"
        })
    }, [])

    return (
        <Provider value={{ appState: state, dispatch }}>{children}</Provider>
    );
};

export const useAppState = () => useContext(appStateContext);
