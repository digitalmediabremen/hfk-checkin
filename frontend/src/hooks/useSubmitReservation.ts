import NewReservation from "../model/api/NewReservation";
import validate from "../model/api/NewReservation.validator";
import { useReservation } from "./useReservationState";
import useValidation from "./useValidation";

export default function useSubmitReservation() {
    const reservation = useReservation();
    const { hasErrors } = useValidation();

    if (hasErrors) return;
    const out = validate(reservation);
}
