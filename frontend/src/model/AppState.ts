import MyProfile from "./api/MyProfile";
import NewReservation from "./api/NewReservation";
import NewReservationBlueprint from "./api/NewReservationBlueprint";
import Reservation from "./api/Reservation";
import { ReservationValidation } from "./validateReservation";

export type TransitionDirection = "left" | "right";

export interface AppState {
    initialized: boolean;
    status?: {
        message: string;
        isError: boolean;
    };
    myProfile?: MyProfile;
    disableNextUpdate: boolean;
    highlightCheckinById?: number; // id
    // reservation object returned from api on successful request
    reservation?: Reservation;
    // template object from hich forms retrieve and write data.
    reservationRequest?: NewReservationBlueprint;
    // validation object, updated on every
    // change of reserverationRequest object
    reservationValidation: ReservationValidation;
    // template object from which a new request can be based on
    reservationRequestTemplate?: NewReservation;
    subPageTransitionDirection: TransitionDirection;
}

export type AppAction =
    | {
          type: "status";
          status:
              | {
                    message: string;
                    isError: boolean;
                }
              | undefined;
      }
    | {
          type: "profile";
          profile: MyProfile | undefined;
          disableNextUpdate?: boolean;
      }
    | {
          type: "enableNextUpdate";
      }
    | {
          type: "disableNextUpdate";
      }
    | {
          type: "checkout";
          highlightCheckinById?: number;
          message: string;
      }
    | {
          type: "highlightedCheckinWasDisplayed";
      }
    | {
          type: "readReservationFromLocalStorage";
      }
    | {
          type: "updateReservation";
          reservation: NewReservationBlueprint | undefined;
      }
    | {
          type: "reservationSuccessful";
          reservationRequestTemplate: NewReservation;
          reservation: Reservation
      }
    | {
          type: "subPageTransitionDirection";
          direction: TransitionDirection;
      };
