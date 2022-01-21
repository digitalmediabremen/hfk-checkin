import Locale from "./api/Locale";
import MyProfile from "./api/MyProfile";
import NewReservation from "./api/NewReservation";
import NewReservationBlueprint from "./api/NewReservationBlueprint";
import { NewReservationValidation } from "./api/NewReservationValidationFixLater";
import Status from "./Status";
import Theme, { ColorScheme } from "./Theme";

export type TransitionDirection = "left" | "right";

export interface AppState {
    initialized: boolean;
    status: Status | undefined;
    myProfile?: MyProfile;
    disableNextUpdate: boolean;
    highlightCheckinById?: number; // id
    showReservationSuccessful?: boolean;
    // template object from hich forms retrieve and write data.
    reservationRequest?: NewReservationBlueprint;
    // validation object, updated on every
    // change of reserverationRequest object
    reservationValidation: NewReservationValidation;
    reservationValidationObservationCount: number;
    // template object from which a new request can be based on
    reservationRequestTemplate?: NewReservation;
    subPageTransitionDirection: TransitionDirection;
    currentLocale: Locale;
    theme: Theme;
    overwriteColorScheme?: ColorScheme;
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
          type: "updateReservationRequest";
          reservation: NewReservationBlueprint | undefined;
      }
    | {
          type: "updateReservationRequestTemplate";
          reservation: NewReservation | undefined;
      }
    | {
          type: "reservationSuccessful";
          reservationRequestTemplate: NewReservation;
          reservationId: string;
      }
    | {
          type: "hideReservationSuccessful";
      }
    | {
          type: "subPageTransitionDirection";
          direction: TransitionDirection;
      }
    | {
          type: "updateLocale";
          locale: string;
      }
    | {
          type: "updateTheme";
          isDesktop?: boolean;
          isPWA?: boolean;
          colorScheme?: ColorScheme;
      }
    | {
          type: "overwriteColorScheme";
          colorScheme: ColorScheme | undefined;
      }
    | {
          type: "observeValidation";
      }
    | {
          type: "unobserveValidation";
      }
    | {
          type: "updateValidation";
          validation: NewReservationValidation;
      };
