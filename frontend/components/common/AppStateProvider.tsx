import React, { SFC, useContext, useReducer, Reducer, useEffect } from "react";
import { AppAction, AppState } from "../../model/AppState";

const appStateContext = React.createContext<{
    appState: AppState;
    dispatch: React.Dispatch<AppAction>;
}>({
    appState: {
        initialized: false,
    },
    dispatch: () => null,
});
const { Provider, Consumer } = appStateContext;

export const AppStateProvider: SFC<{}> = ({ children }) => {
    const [state, dispatch] = useReducer<Reducer<AppState, AppAction>>(
        (previousState, action) => {
            console.log(action);
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
                        profile: undefined,
                    };

                default:
                    throw new Error();
            }
        },
        {
            initialized: false,
        }
    );

    return (
        <Provider value={{ appState: state, dispatch }}>{children}</Provider>
    );
};

export const useAppState = () => useContext(appStateContext);
