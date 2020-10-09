import React, { SFC, useContext, useReducer, Reducer } from "react";
import { AppAction, AppState } from "../../model/AppState";

const appStateContext = React.createContext<{
    appState: AppState;
    dispatch: React.Dispatch<AppAction>;
}>({
    appState: {},
    dispatch: () => null,
});
const { Provider, Consumer } = appStateContext;

export const AppStateProvider: SFC<{}> = ({ children }) => {
    const [state, dispatch] = useReducer<Reducer<AppState, AppAction>>(
        (previousState, action) => {
            switch (action.type) {
                case "apiError":
                    return {
                        ...previousState,
                        error: action.error,
                    };
                default:
                    throw new Error();
            }
        },
        {}
    );

    return (
        <Provider value={{ appState: state, dispatch }}>{children}</Provider>
    );
};

export const useAppState = () => useContext(appStateContext);
