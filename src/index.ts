import { set, isInstanceOf, isUndefined, isObject } from "./utils.js";
import { FieldMapper } from "./mapper";
import { getInterface as _getInterface } from "./generator.js";
import { TMappingSchema } from "./types";

export const convert = (
  schema: TMappingSchema,
  data: unknown
): Record<string, unknown> => {
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

export const pick = (...keys: string[]) => new FieldMapper(keys);

export const getInterface = _getInterface;
