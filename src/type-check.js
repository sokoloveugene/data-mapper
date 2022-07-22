import { isUndefined, typeOf } from "./utils.js";

const types = {
  NUMBER: (data) => typeof data === "number" && !isNaN(data),
  STRING: (data) => typeof data === "string",
  BOOL: (data) => typeof data === "boolean",
  OBJECT: (data) =>
    Boolean(data) && typeof data === "object" && !Array.isArray(data),
  ARRAY: (data) =>
    Boolean(data) && typeof data === "object" && Array.isArray(data),
  NULL: (data) => data === null,
  ANY: () => true,
};

const matchType =
  (validator, isOptional = false) =>
  (value) => {
    return isOptional
      ? validator(value) || isUndefined(value)
      : validator(value);
  };

const checks = {
  string: matchType(types.STRING),
  "?string": matchType(types.STRING, true),
  number: matchType(types.NUMBER),
  "?number": matchType(types.NUMBER, true),
  boolean: matchType(types.BOOL),
  "?boolean": matchType(types.BOOL, true),
  object: matchType(types.OBJECT),
  "?object": matchType(types.OBJECT, true),
  array: matchType(types.ARRAY),
  "?array": matchType(types.ARRAY, true),
  null: matchType(types.NULL),
  "?null": matchType(types.NULL, true),
  any: matchType(types.ANY),
};

const isUnion = (type) =>  type && type.includes("|");
const fromUnionToTypes = (union) => union.split(/\s*\|\s*/);

export const typeCheck = (keys, args, types) => {
  const errors = [];

  const setError = (key, type, value) =>
    errors.push({
      key,
      error: `Expected ${type}, Received ${typeOf(value)}`,
    });

  const validate = (value, type) => {
    const check = checks[type];
    return !check || check(value);
  };

  for (let i = 0; i < args.length; i++) {
    const [key, value, type] = [keys[i], args[i], types[i]];

    if (!type) continue;

    if (!isUnion(type)) {
      const isValid = validate(value, type);
      if (!isValid) setError(key, type, value);
      continue;
    }

    let anyValid = false;
    for (const currentType of fromUnionToTypes(type)) {
      if (validate(value, currentType)) {
        anyValid = true;
        break;
      }
    }
    if (!anyValid) setError(key, type, value);
  }

  return errors;
};
