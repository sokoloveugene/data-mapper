import {
  set,
  isInstanceOf,
  isUndefined,
  isObject,
  DEFAULT_CONTEXT_PREFIX,
} from "./utils.js";
import { FieldMapper } from "./mapper";
import { getInterface as _getInterface } from "./generator.js";
import { TMappingSchema, TOptions } from "./types";

const defaultOptions = {
  context: undefined,
  contextPrefix: DEFAULT_CONTEXT_PREFIX,
};

export const convert = <T = TMappingSchema>(
  schema: T,
  data: unknown,
  optionsOverride: Partial<TOptions>
): Record<string, unknown> => {
  if (!isObject(data)) data = {};

  const result = {};

  for (const [destination, config] of Object.entries(
    schema as TMappingSchema
  )) {
    const value = isInstanceOf(config, FieldMapper)
      ? config
          // @ts-ignore
          ._setDestination(destination)
          ._execute(data, { ...defaultOptions, ...optionsOverride })
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
