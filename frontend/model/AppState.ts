
export interface AppState {
    error?: string;
}

export type AppAction = {
    type: "apiError";
    error: string;
};