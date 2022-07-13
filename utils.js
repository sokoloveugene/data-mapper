// SERVICE FUNCTIONS ==========================================================

const compact = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const isKey = (value) => /^\w*$/.test(value);
const stringToPath = (input) =>
  compact(input.replace(/["|']|\]/g, "").split(/\.|\[/));
const isNullOrUndefined = (val) => val === null || val === undefined;
// SERVICE FUNCTIONS ==========================================================

export const isObject = (value) => Boolean(value) && typeof value === "object";

export const isUndefined = (val) => val === undefined;

export const dummy = () => undefined;

export const isInstanceOf = (obj, constrName) =>
  obj && obj.constructor && obj.constructor.name === constrName;

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
  if (!path || !isObject(obj)) {
    return defaultValue;
  }

  const chunks = path.split(/[,[\].]+?/).filter(Boolean);

  const result = chunks.reduce(
    (result, key) => (isNullOrUndefined(result) ? result : result[key]),
    obj
  );

  return isUndefined(result) || result === obj
    ? isUndefined(obj[path])
      ? defaultValue
      : obj[path]
    : result;
};
