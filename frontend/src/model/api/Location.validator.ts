/* tslint:disable */
// generated by typescript-json-validator
import {inspect} from 'util';
import Ajv from 'ajv';
import Location from './Location';
export const ajv = new Ajv({"allErrors":true,"coerceTypes":false,"format":"fast","nullable":true,"unicode":true,"uniqueItems":true,"useDefaults":true});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));


export const LocationSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "defaultProperties": [
  ],
  "properties": {
    "capacity": {
      "type": [
        "null",
        "number"
      ]
    },
    "code": {
      "type": "string"
    },
    "id": {
      "type": "number"
    },
    "load": {
      "type": "number"
    },
    "org_name": {
      "type": "string"
    },
    "org_number": {
      "type": "string"
    }
  },
  "required": [
    "capacity",
    "code",
    "id",
    "load",
    "org_name",
    "org_number"
  ],
  "type": "object"
};
export type ValidateFunction<T> = ((data: unknown) => data is T) & Pick<Ajv.ValidateFunction, 'errors'>
export const isLocation = ajv.compile(LocationSchema) as ValidateFunction<Location>;
export default function validate(value: unknown): Location {
  if (isLocation(value)) {
    return value;
  } else {
    throw new Error(
      ajv.errorsText(isLocation.errors!.filter((e: any) => e.keyword !== 'if'), {dataVar: 'Location'}) +
      '\n\n' +
      inspect(value),
    );
  }
}
