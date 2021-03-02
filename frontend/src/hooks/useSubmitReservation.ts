import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useApi } from "../../components/api/ApiHooks";
import { updateReservationRequest } from "../../components/api/ApiService";
import { useAppState } from "../../components/common/AppStateProvider";
import { appUrls } from "../../config";
import NewReservation from "../model/api/NewReservation";
import Reservation from "../model/api/Reservation";
import { useReservationRequest } from "./useReservationState";
import useStatus from "./useStatus";
import useValidation from "./useValidation";

export default function useSubmitReservation() {
    const api = useApi<Reservation>();
    const { convertModel: validateModel } = useReservationRequest();
    const { userValidate } = useValidation();
    const { dispatch } = useAppState();
    const router = useRouter();

    const submitReservationRequest = (r: NewReservation) =>
        api.request(() => updateReservationRequest(r));

    const onSuccess = useCallback(
        async (
            reservationObject: Reservation,
            validReservationRequest: NewReservation
        ) => {
            const { identifier } = reservationObject;
            await router.push(...appUrls.reservation(identifier));
            dispatch({
                type: "reservationSuccessful",
                reservation: reservationObject,
                reservationRequestTemplate: validReservationRequest,
            });
            console.log("set to null")
            dispatch({
                type: "updateReservationRequest",
                reservation: undefined,
            });
        },
        []
    );

    const submit = () => {
        const isValid = userValidate();
        if (!isValid) return;

        const validReservation = validateModel();

        (async () => {
            const result = await submitReservationRequest(validReservation);
            if (!result) return;
            onSuccess(result, validReservation);
        })();
    };

    return {
        submit,
        loading: api.state === "loading",
    };
}
