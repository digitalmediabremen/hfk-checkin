import {
    NewReservationValidation,
    ValidationContext,
    ValidationLevel,
    ValidationType,
} from "../model/api/NewReservationValidationFixLater";

export function hasValidationObject(
    validationArray: NewReservationValidation,
    type?: ValidationType,
    level?: ValidationLevel,
    context?: ValidationContext
) {
    // console.log(`check for ${type} ${level} ${context}`, validationArray);
    return (
        getValidationObject(validationArray, type, level, context).length > 0
    );
}

export function getValidationObject(
    validationArray: NewReservationValidation,
    type?: ValidationType,
    level?: ValidationLevel,
    context?: ValidationContext
) {
    return validationArray.filter(
        (validationObject) =>
            validationObject.type === type &&
            (level ? validationObject.level === level : true) &&
            (context ? validationObject.context?.includes(context) : true)
    );
}
