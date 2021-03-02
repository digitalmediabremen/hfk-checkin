import {
    addDates,
    createDateNow,
    duration,
    smallerThan,
} from "./DateTimeUtil";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";

export type ValidationType =
    | "normal"
    | "exceedsBookableRange"
    | "needsExceptionReason"
    | "missingResourcePermissions"
    | "missingFields";

export type ValidationLevel = "notice" | "error";
export interface ValidationObject {
    type: ValidationType;
    level: ValidationLevel;
    message: string;
}

export type ReservationValidation = Array<ValidationObject>;

export default function validateReservation(
    reservation: NewReservationBlueprint
) {
    const v: ReservationValidation = [];
    if (reservation.begin && reservation.end) {
        const exceedsBookableRange = smallerThan(
            addDates(createDateNow(), duration.days(14)),
            reservation.end
        );
        if (exceedsBookableRange) {
            v.push({
                level: "notice",
                type: "exceedsBookableRange",
                message: "",
            });
            if (!reservation.purpose) {
                v.push({
                    level: "error",
                    type: "needsExceptionReason",
                    message: "Ein Ausnahmegrund muss angegeben werden.",
                });
            }
            if (reservation.purpose === "OTHER" && !reservation.message) {
                v.push({
                    level: "error",
                    type: "needsExceptionReason",
                    message: "Ein Ausnahmegrund muss angegeben werden.",
                });
            }
        }
    }

    if (reservation.resource) {
        if (!reservation.resource.access_allowed_to_current_user) {
            v.push({
                level: "notice",
                type: "missingResourcePermissions",
                message: "Ein Ausnahmegrund muss angegeben werden.",
            });
        }
    }

    if (!reservation.resource_uuid) {
        v.push({
            level: "error",
            type: "missingFields",
            message: "Du musst noch den Raum auswählen.",
        });
    }
    if (!reservation.begin || !reservation.end) {
        v.push({
            level: "error",
            type: "missingFields",
            message: "Du musst noch eine Zeit angeben.",
        });
    }
    return v;
}
