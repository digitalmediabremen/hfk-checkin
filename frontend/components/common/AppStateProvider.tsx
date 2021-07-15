import React, { FunctionComponent, useContext, useEffect } from "react";
import useMedia from "use-media";
import { isClient } from "../../config";
import useLocalStorage from "../../src/hooks/useLocalStorage";
import useSWRefreshToUpdate from "../../src/hooks/useSWRefreshToUpdate";
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

const { Provider, Consumer  } = appStateContext;

export const AppStateConsumer = Consumer;

export const AppStateProvider: FunctionComponent<{}> = ({ children }) => {
    const [appState, dispatch] = useReduceAppState();

    const isDesktop = useMedia({ minWidth: 600 });
    const isPwa =
        useMedia({ displayMode: "standalone" }) ||
        // @ts-ignore
        (isClient && window.navigator.standalone === true);

    useEffect(() => {
        dispatch({
            type: "updateTheme",
            theme: {
                isDesktop,
                fontSize: isDesktop ? 18 : 16,
                unit: isDesktop ? 9 : 8,
                borderRadius: isDesktop ? 6 : 5,
                offsetTopBar: isPwa ? 0 : 0,
            },
        });
    }, [isDesktop]);

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

    useSWRefreshToUpdate();

    return <Provider value={{ appState, dispatch }}>{children}</Provider>;
};

export const useAppState = () => useContext(appStateContext);
