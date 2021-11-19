import { useAppState } from "../../components/common/AppStateProvider";
import validateRequest from "../model/api/NewReservationBlueprint.validator";
import validateRequestTemplate from "../model/api/NewReservation.validator";

import useLocalStorage from "./useLocalStorage";
import useSWRefreshToUpdate from "./useSWRefreshToUpdate";
import { useInitTheme } from "./useTheme";
import { useUpdateProfileFromAppStateAndUpdate } from "../../components/api/ApiHooks";
import { validateColorScheme } from "../model/Theme";

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

    useSWRefreshToUpdate();

    return themeInitialized;
}
