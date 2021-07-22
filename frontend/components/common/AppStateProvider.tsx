import React, { FunctionComponent, useContext } from "react";
import useLocalStorage from "../../src/hooks/useLocalStorage";
import useSWRefreshToUpdate from "../../src/hooks/useSWRefreshToUpdate";
import { useInitTheme } from "../../src/hooks/useTheme";
import validateRequestTemplate from "../../src/model/api/NewReservation.validator";
import validate from "../../src/model/api/NewReservationBlueprint.validator";
import { AppAction, AppState } from "../../src/model/AppState";
import useReduceAppState, { initialAppState } from "../api/useReduceAppState";

const appStateContext = React.createContext<{
    appState: AppState;
    dispatch: React.Dispatch<AppAction>;
}>({
    appState: initialAppState,
    dispatch: () => undefined,
});

const { Provider, Consumer } = appStateContext;

export const AppStateConsumer = Consumer;

export const AppStateProvider: FunctionComponent<{}> = ({ children }) => {
    const [appState, dispatch] = useReduceAppState();
    return <Provider value={{ appState, dispatch }}>{children}</Provider>;
};

export const useAppState = () => useContext(appStateContext);
