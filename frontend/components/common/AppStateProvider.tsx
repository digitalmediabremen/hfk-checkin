import React, { SFC, useContext, useReducer, Reducer, useEffect } from "react";
import { AppAction, AppState } from "../../model/AppState";

const initialAppState: AppState = {
    initialized: false,
    disableNextUpdate: false,
};

const appStateContext = React.createContext<{
    appState: AppState;
    dispatch: React.Dispatch<AppAction>;
}>({
    appState: initialAppState,
    dispatch: () => null,
});

const { Provider, Consumer } = appStateContext;

export const AppStateProvider: SFC<{}> = ({ children }) => {
    const [state, dispatch] = useReducer<Reducer<AppState, AppAction>>(
        (previousState, action) => {
            switch (action.type) {
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
                            profile: action.profile,
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
                            isError: false
                        }
                    }
                case "highlightedCheckinWasDisplayed":
                    return {
                        ...previousState,
                        highlightCheckinById: undefined
                    }
                default:
                    throw new Error();
            }
        },
        initialAppState
    );

    return (
        <Provider value={{ appState: state, dispatch }}>{children}</Provider>
    );
};

export const useAppState = () => useContext(appStateContext);
