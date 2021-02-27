import NewReservation from "./api/NewReservation";
import NewReservationBlueprint from "./api/NewReservationBlueprint";
import Profile from "./api/Profile";
import { ReservationValidation } from "./validateReservation";

export type TransitionDirection = "left" | "right";

export interface AppState {
    status?: {
        message: string;
        isError: boolean;
    };
    profile?: Profile;
    disableNextUpdate: boolean;
    highlightCheckinById?: number, // id
    initialized: boolean;
    reservationRequest?: NewReservationBlueprint;
    reservationValidation: ReservationValidation;
    reservationTemplate?: NewReservation;
    subPageTransitionDirection: TransitionDirection;
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
} | {
    type: "readReservationFromLocalStorage"
} | {
    type: "updateReservation",
    reservation: NewReservationBlueprint | undefined
} | {
    type: "subPageTransitionDirection",
    direction: TransitionDirection
}