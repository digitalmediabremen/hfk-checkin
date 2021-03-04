import React, { FunctionComponent, useContext, useEffect, useLayoutEffect } from "react";
import useMedia from "use-media";
import useLocalStorage from "../../src/hooks/useLocalStorage";
import useTheme from "../../src/hooks/useTheme";
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

const { Provider } = appStateContext;

export const AppStateProvider: FunctionComponent<{}> = ({ children }) => {
    const [appState, dispatch] = useReduceAppState();

    const isWide = useMedia({ minWidth: 500 });
    const isPwa = useMedia({ displayMode: "standalone" })

    useEffect(() => {
        dispatch({
            type: "updateTheme",
            theme: {
                fontSize: isWide ? 18 : 16,
                unit: isWide ? 9 : 8,
                borderRadius: isWide ? 6 : 5,
                offsetTopBar: isPwa ? 16 : 0 
            },
        });
    }, [isWide]);

    useLocalStorage("rr", appState.reservationRequest, validate, (r) =>
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
