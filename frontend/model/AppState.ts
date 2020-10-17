import Profile from "./Profile";

export interface AppState {
    status?: {
        message: string;
        isError: boolean;
    };
    profile?: Profile;
    initialized: boolean;
}

export type AppAction = {
    type: "status";
    status: {
        message: string;
        isError: boolean;
    } | undefined
} | {
    type: "profile";
    profile: Profile | undefined;
} | {
    type: "initialized";
    initialized: boolean;
}