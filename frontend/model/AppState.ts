import Profile from "./Profile";

export interface AppState {
    status?: {
        message: string;
        isError: boolean;
    };
}

export type AppAction = {
    type: "status";
    status: {
        message: string;
        isError: boolean;
    } | undefined
};