import { useTranslation } from "../../localization";
import {
    addDates,
    createDateNow,
    duration,
    smallerThan,
} from "../util/DateTimeUtil";
import NewReservationBlueprint from "./api/NewReservationBlueprint";

export type ValidationType =
    | "normal"
    | "exceedsBookableRange"
    | "needsExceptionReason"
    | "missingResourcePermissions";
export interface ValidationObject {
    type: ValidationType;
    message: string;
}

export type ReservationValidation = Array<ValidationObject>;

export default function validateReservation(
    reservation: NewReservationBlueprint
) {
    const v: ReservationValidation = [];
    if (reservation.start && reservation.end) {
        const exceedsBookableRange = smallerThan(
            addDates(createDateNow(), duration.days(14)),
            reservation.end
        );
        if (exceedsBookableRange) {
            v.push({
                type: "exceedsBookableRange",
                message: "",
            });
            if (!reservation.purpose) {
                v.push({
                    type: "needsExceptionReason",
                    message: "Ein Ausnahmegrund muss angegeben werden.",
                });
            }
            if (
                reservation.purpose === "OTHER" &&
                !reservation.comment
            ) {
                v.push({
                    type: "needsExceptionReason",
                    message: "Ein Ausnahmegrund muss angegeben werden.",
                });
            }
        }
    }

    if (reservation.resource) {
        if (!reservation.resource.access_allowed_to_current_user) {
            v.push({
                type: "missingResourcePermissions",
                message: "Ein Ausnahmegrund muss angegeben werden.",
            });
        }
    }
    return v;
}
