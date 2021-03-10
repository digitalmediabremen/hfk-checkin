import { addDates, createDateNow, duration, smallerThan } from "./DateTimeUtil";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import { TranslationFunction, _t } from "../../localization";
import { notEmpty } from "./TypeUtil";

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

// returns the bookable range for a requested resource in days
function calculateBookableRange(reservation: NewReservationBlueprint) {
    return (
        (notEmpty(reservation.resource) &&
            reservation.resource.reservable_max_days_in_advance) ||
        14
    );
}

// @translation-module: hallo
export default function validateReservation(
    reservation: NewReservationBlueprint,
    locale: string
) {
    const v: ReservationValidation = [];
    if (reservation.begin && reservation.end) {
        const bookableRange = calculateBookableRange(reservation);
        const exceedsBookableRange = smallerThan(
            addDates(createDateNow(), duration.days(bookableRange)),
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
                    message: _t(
                        locale,
                        "request",
                        "Ein Ausnahmegrund muss angegeben werden."
                    ),
                });
            }
            if (reservation.purpose === "OTHER" && !reservation.message) {
                v.push({
                    level: "error",
                    type: "needsExceptionReason",
                    message: _t(
                        locale,
                        "request",
                        "Ein Ausnahmegrund muss angegeben werden."
                    ),
                });
            }
        }
    }

    if (reservation.resource) {
        if (!reservation.resource.access_allowed_to_current_user) {
            v.push({
                level: "error",
                type: "missingResourcePermissions",
                message: _t(
                    locale,
                    "request",
                    `Du hast keine Berichtigung den Raum "{resource}" zu buchen.`,
                    { resource: reservation.resource.name }
                ),
            });
        }
    }

    if (!reservation.resource_uuid) {
        v.push({
            level: "error",
            type: "missingFields",
            message: _t(locale, "request", "Du musst noch den Raum auswählen."),
        });
    }
    if (!reservation.begin || !reservation.end) {
        v.push({
            level: "error",
            type: "missingFields",
            message: _t(locale, "request", "Du musst noch eine Zeit angeben."),
        });
    }
    return v;
}
