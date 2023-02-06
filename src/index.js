import { set, isInstanceOf, isUndefined, isObject } from "./utils.js";
import { FieldMapper } from "./mapper.js";

export const convert = (schema, data) => {
  if (!isObject(data)) data = {};

  const result = {};

  for (const [destination, config] of Object.entries(schema)) {
    const value = isInstanceOf(config, "FieldMapper")
      ? config._setDestination(destination)._execute(data)
      : config;

    if (isUndefined(value)) continue;

    destination.startsWith("...")
      ? Object.assign(result, value)
      : set(result, destination, value);
  }

  return result;
};

export const pick = (...keys) => new FieldMapper(keys);