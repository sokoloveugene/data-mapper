import { isUndefined } from "./utils.js";

const types = {
  NUMBER: (data) => typeof data === "number" && !isNaN(data),
  STRING: (data) => typeof data === "string",
  DATE: (data) => typeof data === "date",
  BOOL: (data) => typeof data === "boolean",
  OBJECT: (data) =>
    Boolean(data) && typeof data === "object" && !Array.isArray(data),
  ARRAY: (data) =>
    Boolean(data) && typeof data === "object" && Array.isArray(data),
  NULL: (data) => data === null,
  ANY: () => true,
};

const matchType =
  ({ validator, isOptional = false }) =>
  (value) => {
    return isOptional
      ? validator(value) || isUndefined(value)
      : validator(value);
  };

const checks = {
  string: matchType({ validator: types.STRING }),
  "?string": matchType({ validator: types.STRING, isOptional: true }),
  number: matchType({ validator: types.NUMBER }),
  "?number": matchType({ validator: types.NUMBER, isOptional: true }),
  boolean: matchType({ validator: types.BOOL }),
  "?boolean": matchType({ validator: types.BOOL, isOptional: true }),
  object: matchType({ validator: types.OBJECT }),
  "?object": matchType({ validator: types.OBJECT, isOptional: true }),
  array: matchType({ validator: types.ARRAY }),
  "?array": matchType({ validator: types.ARRAY, isOptional: true }),
  null: matchType({ validator: types.NULL }),
  "?null": matchType({ validator: types.NULL, isOptional: true }),
  any: matchType({ validator: types.ANY }),
};

export const typeCheck = (keys, args, types) => {
  const errors = {};

  for (let i = 0; i < args.length; i++) {
    const [key, value, type] = [keys[i], args[i], types[i]];

    const check = checks[type];

    if (!check) continue;

    const isValid = check(value);

    if (!isValid) {
      errors[key] = {
        expected: type,
        received: value,
      };
    }
  }

  return Object.keys(errors).length ? errors : undefined;
};
