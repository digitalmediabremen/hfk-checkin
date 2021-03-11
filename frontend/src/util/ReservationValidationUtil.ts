import { _t } from "../../localization";
import NewReservationBlueprint from "../model/api/NewReservationBlueprint";
import { addDates, createDateNow, duration, smallerThan } from "./DateTimeUtil";
import { calculateBookableRange } from "./ReservationUtil";
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
    group?: string;
}

export type Validation = Array<ValidationObject>;

// @translation-module: hallo
export default function validateReservation(
    reservation: NewReservationBlueprint,
    locale: string
) {
    const previousValidation = _validateReservation(reservation, locale, []);
    return _validateReservation(reservation, locale, previousValidation);
}

export function hasValidationObject(
    v: Validation,
    type?: ValidationType,
    level?: ValidationLevel,
    group?: string
) {
    return getValidationObject(v, type, level, group).length > 0;
}

export function getValidationObject(
    v: Validation,
    type?: ValidationType,
    level?: ValidationLevel,
    group?: string
) {
    return v.filter(
        (r) =>
            r.type === type &&
            (level ? r.level === level : true) &&
            (group ? r.group === group : true)
    );
}

function exceedsBookingRange(reservation: NewReservationBlueprint) {
    if (reservation.begin && reservation.end) {
        const { range: bookableRange } = calculateBookableRange(
            reservation
        );
        return smallerThan(
            addDates(createDateNow(), duration.days(bookableRange)),
            reservation.end
        );
    }
    return false;
}

function hasMissingResourcePermissions(reservation: NewReservationBlueprint) {
    return (
        reservation.resource &&
        !reservation.resource.access_allowed_to_current_user
    );
}

function _validateReservation(
    reservation: NewReservationBlueprint,
    locale: string,
    previousValidation: Validation
) {
    const v: Validation = [];
    const { range: bookableRange } = calculateBookableRange(reservation);
    const { resource } = reservation;
    const vHasExceptionReason =
        !!reservation.purpose ||
        (reservation.purpose === "OTHER" && reservation.message);
    const vExceedsBookingRange = exceedsBookingRange(reservation);
    const vHasMissingResourcePermissions = hasMissingResourcePermissions(
        reservation
    );
    if (vExceedsBookingRange && !vHasExceptionReason) {
        v.push({
            level: "error",
            type: "exceedsBookableRange",
            message: notEmpty(resource)
                ? _t(
                      locale,
                      "time",
                      `Der Raum "{resource}" kann maximal {days} Tage im Vorraus gebucht werden.`,
                      {
                          resource: resource.name,
                          days: bookableRange,
                      }
                  )
                : _t(
                      locale,
                      "time",
                      `Räume können maximal {days} Tage im Vorraus gebucht werden.`,
                      {
                          days: bookableRange,
                      }
                  ),
        });
    }

    if (!vHasExceptionReason && vHasMissingResourcePermissions) {
        v.push({
            level: "error",
            type: "missingResourcePermissions",
            group: "resource",
            message: _t(
                locale,
                "request",
                `Du hast keine Berichtigung den Raum "{resource}" zu buchen.`,
                { resource: resource!.name }
            ),
        });
    }

    if (
        !vHasExceptionReason &&
        (vHasMissingResourcePermissions || vExceedsBookingRange)
    ) {
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
