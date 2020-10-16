import React, { SFC, useContext, useReducer, Reducer, useEffect } from "react";
import { AppAction, AppState } from "../../model/AppState";
import { useProfile } from "../api/ApiHooks";

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
                case "status":
                    return {
                        ...previousState,
                        status: action.status,
                    };
                case "profile":
                    return {
                        ...previousState,
                        profile: action.profile,
                    };

                default:
                    throw new Error();
            }
        },
        {}
    );

    const { profile, getProfile, error } = useProfile();

    useEffect(() => {
        dispatch({
            type: "profile",
            profile,
        });
        // dispatch({
        //     type: 'status',
        //     status: error ? {
        //         message: error,
        //         isError: true
        //     }: undefined,
        // });
    }, [profile, error]);

    useEffect(() => getProfile(), []);

    return (
        <Provider value={{ appState: state, dispatch }}>{children}</Provider>
    );
};

export const useAppState = () => useContext(appStateContext);
