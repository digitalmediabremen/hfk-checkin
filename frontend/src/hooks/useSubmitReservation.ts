import { useRouter } from "next/router";
import { useEffect } from "react";
import { useApi } from "../../components/api/ApiHooks";
import { updateReservationRequest } from "../../components/api/ApiService";
import { appUrls } from "../../config";
import NewReservation from "../model/api/NewReservation";
import validate from "../model/api/NewReservation.validator";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import Reservation from "../model/api/Reservation";
import { useReservation } from "./useReservationState";
import useStatus from "./useStatus";
import useValidation from "./useValidation";

export default function useSubmitReservation() {
    const api = useApi<Reservation>();
    const reservation = useReservation();
    const { allErrors, hasErrors } = useValidation();
    const { setError } = useStatus();
    const router = useRouter();

    const submitReservationRequest = (r: NewReservation) =>
        api.request(() => updateReservationRequest(r));

    useEffect(() => {
        if (api.state === "success") {
            const reservationObject = api.result;
            const { uuid } = reservationObject;
            router.push(...appUrls.reservation(uuid));
        }
    }, [api.state]);

    const submit = () => {
        if (hasErrors) {
            console.error("hasErrors");
            setError(allErrors);
            return;
        }
        try {
            // unset resource
            // we dont want to submit it
            const data: NewReservationBlueprint = {
                ...reservation,
                resource: undefined,
            };
            const reservationDateStrings = JSON.parse(JSON.stringify(data));
            const out = validate(reservationDateStrings);
            submitReservationRequest(out);
        } catch (e) {
            console.error("Not a valid NewReservation model");
            console.trace(e);
        }
    };

    return submit;
}
