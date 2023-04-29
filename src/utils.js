const compact = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const isKey = (value) => /^\w*$/.test(value);
const stringToPath = (input) =>
  compact(input.replace(/["|']|\]/g, "").split(/\.|\[/));
export const isNullOrUndefined = (val) => val === null || val === undefined;

export const isObject = (value) => Boolean(value) && typeof value === "object";

export const isUndefined = (val) => val === undefined;

export const dummy = () => undefined;

export const isInstanceOf = (obj, constructor) => obj instanceof constructor;

export const set = (object, path, value) => {
  let index = -1;
  const tempPath = isKey(path) ? [path] : stringToPath(path);
  const length = tempPath.length;
  const lastIndex = length - 1;

  while (++index < length) {
    const key = tempPath[index];
    let newValue = value;

    if (index !== lastIndex) {
      const objValue = object[key];
      newValue =
        isObject(objValue) || Array.isArray(objValue)
          ? objValue
          : !isNaN(+tempPath[index + 1])
          ? []
          : {};
    }
    object[key] = newValue;
    object = object[key];
  }
  return object;
};

export const get = (obj, path, defaultValue) => {
  if (!obj || typeof obj !== "object") {
    return defaultValue;
  }
  const chunks = path.split(/[,[\].]+?/).filter(Boolean);
  let result = obj;
  for (const chunk of chunks) {
    if (result === null || result === undefined) {
      break;
    }
    result = result[chunk];
  }
  return result === undefined ? defaultValue : result;
};

export const MODE = {
  DEFAULT: "DEFAULT",
  APPLY: "APPLY",
  MAP: "MAP",
  MAP_WHEN: "MAP_WHEN",
  SWITCH: "SWITCH",
  SWITCH_MAP: "SWITCH_MAP",
  REDUCE: "REDUCE",
};

export const DEFAULT_CONTEXT_PREFIX = "$";

const getPrefixRegex = (contextPrefix) => {
  return new RegExp(`^${"\\"}${contextPrefix}${"\\.?"}`);
};

export const isContextPath = (contextPrefix, path) => {
  return getPrefixRegex(contextPrefix).test(path);
};

export const resoveContextPath = (contextPrefix, path) => {
  return isContextPath(contextPrefix, path)
    ? path.replace(getPrefixRegex(contextPrefix), "")
    : path;
};
