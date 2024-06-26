/* tslint:disable */
// generated by typescript-json-validator
import {inspect} from 'util';
import Ajv from 'ajv';
import NewReservationValidationFixLater from './NewReservationValidationFixLater';
export const ajv = new Ajv({"allErrors":true,"coerceTypes":false,"format":"fast","nullable":true,"unicode":true,"uniqueItems":true,"useDefaults":true});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));


export const NewReservationValidationFixLaterSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "defaultProperties": [
  ],
  "definitions": {
    "Partial<Record<\"end\"|\"begin\"|\"resource_uuid\"|\"attendees\"|\"number_of_extra_attendees\"|\"message\"|\"purpose\"|\"agreed_to_phone_contact\"|\"exclusive_resource_usage\"|\"non_field_errors\",string[]>>": {
      "defaultProperties": [
      ],
      "properties": {
        "agreed_to_phone_contact": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "attendees": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "begin": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "end": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "exclusive_resource_usage": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "message": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "non_field_errors": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "number_of_extra_attendees": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "purpose": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "resource_uuid": {
          "items": {
            "type": "string"
          },
          "type": "array"
        }
      },
      "type": "object"
    },
    "ValidationLevel": {
      "enum": [
        "error",
        "notice",
        "warning"
      ],
      "type": "string"
    },
    "ValidationObject": {
      "defaultProperties": [
      ],
      "properties": {
        "context": {
          "items": {
          },
          "type": "array"
        },
        "detail": {
          "type": "string"
        },
        "level": {
          "$ref": "#/definitions/ValidationLevel"
        },
        "type": {
          "$ref": "#/definitions/ValidationType"
        }
      },
      "required": [
        "detail",
        "level",
        "type"
      ],
      "type": "object"
    },
    "ValidationType": {
      "enum": [
        "ReservationAvailabilityWarning",
        "ReservationCapacityCriticalWarning",
        "ReservationCapacityNotice",
        "ReservationCapacityWarning",
        "ReservationCollisionWarning",
        "ReservationFieldError",
        "ReservationNonFieldError",
        "ReservationPermissionCriticalWarning",
        "ReservationPermissionWarning",
        "ReservationTimingWarning"
      ],
      "type": "string"
    }
  },
  "properties": {
    "errors": {
      "$ref": "#/definitions/Partial<Record<\"end\"|\"begin\"|\"resource_uuid\"|\"attendees\"|\"number_of_extra_attendees\"|\"message\"|\"purpose\"|\"agreed_to_phone_contact\"|\"exclusive_resource_usage\"|\"non_field_errors\",string[]>>",
      "description": "Make all properties in T optional"
    },
    "warnings": {
      "items": {
        "$ref": "#/definitions/ValidationObject"
      },
      "type": "array"
    }
  },
  "type": "object"
};
export type ValidateFunction<T> = ((data: unknown) => data is T) & Pick<Ajv.ValidateFunction, 'errors'>
export const isNewReservationValidationFixLater = ajv.compile(NewReservationValidationFixLaterSchema) as ValidateFunction<NewReservationValidationFixLater>;
export default function validate(value: unknown): NewReservationValidationFixLater {
  if (isNewReservationValidationFixLater(value)) {
    return value;
  } else {
    throw new Error(
      ajv.errorsText(isNewReservationValidationFixLater.errors!.filter((e: any) => e.keyword !== 'if'), {dataVar: 'NewReservationValidationFixLater'}) +
      '\n\n' +
      inspect(value),
    );
  }
}
