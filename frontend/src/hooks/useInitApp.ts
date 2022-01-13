import { useAppState } from "../../components/common/AppStateProvider";
import validateRequest from "../model/api/NewReservationBlueprint.validator";
import validateRequestTemplate from "../model/api/NewReservation.validator";

import useLocalStorage from "./useLocalStorage";
import useSWRefreshToUpdate from "./useSWRefreshToUpdate";
import { useInitTheme } from "./useTheme";
import { useUpdateProfileFromAppStateAndUpdate } from "../../components/api/ApiHooks";
import { validateColorScheme } from "../model/Theme";
import useValidateReservationOnChange from "./useValidateReservationOnChange";
import useReservationState from "./useReservationState";
import { empty } from "../util/TypeUtil";

// state initialization of the app
export default function useInitApp() {
    const { dispatch, appState } = useAppState();

    useUpdateProfileFromAppStateAndUpdate();

    const themeInitialized = useInitTheme();

    useLocalStorage("rr", appState.reservationRequest, validateRequest, (r) =>
        dispatch({
            type: "updateReservationRequest",
            reservation: r,
        })
    );

    useLocalStorage(
        "rrt",
        appState.reservationRequestTemplate,
        validateRequestTemplate,
        (r) =>
            dispatch({
                type: "updateReservationRequestTemplate",
                reservation: r,
            })
    );

    useLocalStorage(
        "scheme",
        appState.overwriteColorScheme,
        validateColorScheme,
        (colorScheme) => {
            dispatch({
                type: "overwriteColorScheme",
                colorScheme
            });
        }
    );

    const [agreedToPhoneContact, setAgreedToPhoneContact] = useReservationState(
        "agreed_to_phone_contact"
    );
    useLocalStorage("atpc", agreedToPhoneContact, undefined, (set) => {
        if (empty(set)) return;
        setAgreedToPhoneContact(set);
    });

    useSWRefreshToUpdate();

    useValidateReservationOnChange();

    return themeInitialized;
}
