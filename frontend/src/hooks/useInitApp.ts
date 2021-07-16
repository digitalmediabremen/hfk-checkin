import { useAppState } from "../../components/common/AppStateProvider";
import validateRequest from "../model/api/NewReservationBlueprint.validator";
import validateRequestTemplate from "../model/api/NewReservation.validator";

import useLocalStorage from "./useLocalStorage";
import useSWRefreshToUpdate from "./useSWRefreshToUpdate";
import { useInitTheme } from "./useTheme";
import { useUpdateProfileFromAppStateAndUpdate } from "../../components/api/ApiHooks";

// state initialization of the app
export default function useInitApp() {
    const { dispatch, appState } = useAppState();

    useUpdateProfileFromAppStateAndUpdate();

    useInitTheme();

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

    useSWRefreshToUpdate();
}
