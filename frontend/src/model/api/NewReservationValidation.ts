const testResult = [
    {
        type: "ReservationCapacityCriticalWarning",
        detail: "The resource's capacity (1) is already exhausted for some of the period. Total attendance (incl. this one): 1.",
        level: "warning",
        context: ["capacity"],
    },
];

export type ValidationType =
    | "ReservationWarning"
    | "ReservationNotice"
    | "ReservationCriticalWarning"
    | "ReservationCollisionWarning"
    | "ReservationCapacityCriticalWarning"
    | "ReservationCapacityWarning"
    | "ReservationCapacityNotice"
    | "ReservationAvailabilityWarning"
    | "ReservationTimingWarning"
    | "ReservationPermissionWarning"
    | "ReservationPermissionCriticalWarning";

export type ValidationContext = "capacity" | "resource" | "datetime" | "access"

export type ValidationLevel = "notice" | "warning";

export interface ValidationObject {
    type: ValidationType;
    detail: string;
    level: ValidationLevel;
    context?: Array<ValidationContext>;
}

type NewReservationValidation = Array<ValidationObject>;

export default NewReservationValidation;
