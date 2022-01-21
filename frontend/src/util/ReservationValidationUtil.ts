import {
    NewReservationValidation,
    ValidationContext,
    ValidationLevel,
    ValidationType,
} from "../model/api/NewReservationValidationFixLater";

export function hasValidationObject(
    v: NewReservationValidation,
    type?: ValidationType,
    level?: ValidationLevel,
    group?: ValidationContext
) {
    return getValidationObject(v, type, level, group).length > 0;
}

export function getValidationObject(
    v: NewReservationValidation,
    type?: ValidationType,
    level?: ValidationLevel,
    context?: ValidationContext
) {
    return v.filter(
        (r) =>
            r.type === type &&
            (level ? r.level === level : true) &&
            (context ? r.context?.includes(context) : true)
    );
}
