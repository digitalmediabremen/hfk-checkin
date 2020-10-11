import Profile from "./Profile";

export interface AppState {
    error?: string;
    profile?: Profile;
}

export type AppAction = {
    type: "apiError";
    error: string | undefined;
} | {
    type: "setProfile";
    profile: Profile | undefined;
};