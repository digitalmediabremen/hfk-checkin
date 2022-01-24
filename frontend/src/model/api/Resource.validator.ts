/* tslint:disable */
// generated by typescript-json-validator
import {inspect} from 'util';
import Ajv from 'ajv';
import Resource from './Resource';
export const ajv = new Ajv({"allErrors":true,"coerceTypes":false,"format":"fast","nullable":true,"unicode":true,"uniqueItems":true,"useDefaults":true});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));


export const ResourceSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "defaultProperties": [
  ],
  "definitions": {
    "default": {
      "defaultProperties": [
      ],
      "properties": {
        "name": {
          "type": "string"
        },
        "slug": {
          "type": "string"
        },
        "uuid": {
          "type": "string"
        }
      },
      "required": [
        "name",
        "slug",
        "uuid"
      ],
      "type": "object"
    }
  },
  "properties": {
    "access_allowed_to_current_user": {
      "type": "boolean"
    },
    "access_delegates": {
      "anyOf": [
        {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        {
          "type": "null"
        }
      ]
    },
    "access_restricted": {
      "type": "boolean"
    },
    "alternative_names": {
      "anyOf": [
        {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        {
          "type": "null"
        }
      ]
    },
    "area": {
      "type": [
        "null",
        "string"
      ]
    },
    "capacity": {
      "type": [
        "null",
        "number"
      ]
    },
    "description": {
      "type": [
        "null",
        "string"
      ]
    },
    "display_name": {
      "type": "string"
    },
    "display_numbers": {
      "type": [
        "null",
        "string"
      ]
    },
    "features": {
      "anyOf": [
        {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        {
          "type": "null"
        }
      ]
    },
    "floor_name": {
      "type": [
        "null",
        "string"
      ]
    },
    "floor_number": {
      "type": [
        "null",
        "number"
      ]
    },
    "name": {
      "type": "string"
    },
    "reservable": {
      "type": "boolean"
    },
    "reservable_max_days_in_advance": {
      "type": [
        "null",
        "number"
      ]
    },
    "reservable_min_days_in_advance": {
      "type": [
        "null",
        "number"
      ]
    },
    "slot_size": {
      "type": [
        "null",
        "string"
      ]
    },
    "unit": {
      "$ref": "#/definitions/default"
    },
    "uuid": {
      "type": "string"
    }
  },
  "required": [
    "access_allowed_to_current_user",
    "access_delegates",
    "access_restricted",
    "alternative_names",
    "area",
    "capacity",
    "description",
    "display_name",
    "display_numbers",
    "features",
    "floor_name",
    "floor_number",
    "name",
    "reservable",
    "reservable_max_days_in_advance",
    "reservable_min_days_in_advance",
    "slot_size",
    "unit",
    "uuid"
  ],
  "type": "object"
};
export type ValidateFunction<T> = ((data: unknown) => data is T) & Pick<Ajv.ValidateFunction, 'errors'>
export const isResource = ajv.compile(ResourceSchema) as ValidateFunction<Resource>;
export default function validate(value: unknown): Resource {
  if (isResource(value)) {
    return value;
  } else {
    throw new Error(
      ajv.errorsText(isResource.errors!.filter((e: any) => e.keyword !== 'if'), {dataVar: 'Resource'}) +
      '\n\n' +
      inspect(value),
    );
  }
}
