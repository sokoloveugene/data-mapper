import {
  set,
  isInstanceOf,
  isUndefined,
  isObject,
  notEmpty,
  toError,
} from "./utils.js";

export const convert = (schema, data, errorStorage, prefixes = []) => {
  if (!isObject(data)) data = {};

  const isRoot = isUndefined(errorStorage)
    ? ((errorStorage = {}), true)
    : false;

  const result = {};

  for (const [destination, config] of Object.entries(schema)) {
    const value = isInstanceOf(config, "Mapper")
      ? config
          ._setDestination(destination)
          ._setPrefixes(prefixes)
          ._setErrorStorage(errorStorage)
          ._execute(data)
      : config;

    if (isUndefined(value)) continue;

    destination.startsWith("...")
      ? Object.assign(result, value)
      : set(result, destination, value);
  }

  if (isRoot && notEmpty(errorStorage)) {
    throw new Error(toError(errorStorage));
  }

  return result;
};
