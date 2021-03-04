import React, { FunctionComponent, useContext, useLayoutEffect } from "react";
import { useMediaLayout } from "use-media";
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

    const isWide = useMediaLayout({ minWidth: 500 });

    useLayoutEffect(() => {
        console.log("update");
        dispatch({
            type: "updateTheme",
            theme: {
                fontSize: isWide ? 18 : 16,
                unit: isWide ? 10 : 8,
                borderRadius: isWide ? 6 : 5
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
