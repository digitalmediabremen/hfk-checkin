import { AlertTriangle, AlertCircle } from "react-feather";
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

export function getValidationLevelIcon(level?: ValidationLevel) {
    if (level === "error") return AlertTriangle;
    else if (level === "warning") return AlertTriangle;
    else if (level === "notice") return AlertCircle;
    return null;
}
