import { DeepWritable } from "../../util/TypeUtil";
import Reservation from "./Reservation";

const testResult = [
    {
        type: "ReservationCapacityCriticalWarning",
        detail: "The resource's capacity (1) is already exhausted for some of the period. Total attendance (incl. this one): 1.",
        level: "warning",
        context: ["capacity"],
    },
];

export type ValidationType =
    | "ReservationCollisionWarning"
    | "ReservationCapacityCriticalWarning"
    | "ReservationCapacityWarning"
    | "ReservationCapacityNotice"
    | "ReservationAvailabilityWarning"
    | "ReservationTimingWarning"
    | "ReservationPermissionWarning"
    | "ReservationPermissionCriticalWarning"
    | "ReservationFieldError"
    | "ReservationNonFieldError";

type ValidationFieldContext = `field.${ReservationFieldKeys}`;
export type ValidationContext =
    | "capacity"
    | "resource"
    | "datetime"
    | "access"
    | ValidationFieldContext;

export type ValidationLevel = "notice" | "warning" | "error";

export interface ValidationObject {
    type: ValidationType;
    detail: string;
    level: ValidationLevel;
    context?: Array<ValidationContext>;
}

type ReservationFieldKeys = Exclude<keyof DeepWritable<Reservation>, undefined>;
export type ValidationErrorDict = Record<
    ReservationFieldKeys | "non_field_errors",
    Array<string>
>;

export default interface NewReservationValidationFixLater {
    errors?: Partial<ValidationErrorDict>;
    warnings?: Array<ValidationObject>;
}

export type NewReservationValidation = Array<ValidationObject>;
