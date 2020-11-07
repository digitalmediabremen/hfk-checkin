import Profile from "./Profile";

export interface AppState {
    status?: {
        message: string;
        isError: boolean;
    };
    profile?: Profile;
    disableNextUpdate: boolean;
    highlightCheckinById: number, // id
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
    disableNextUpdate?: boolean;
} | {
    type: "enableNextUpdate"
} | {
    type: "disableNextUpdate"
} | {
    type: "checkout",
    highlightCheckinById?: number,
    message: string,
} | {
    type: "highlightedCheckinWasDisplayed",
}