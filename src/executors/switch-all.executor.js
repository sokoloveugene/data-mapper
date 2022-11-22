import { isUndefined } from "../utils.js";
import { convert } from "../index.js";

export const switchAllExecutor = (scope, values) => {
  const mapped = values?.reduce((acc, value) => {
    const type = scope.predicate(value);
    const schemaByType = scope.switchMap[type];
    const isValid = !!schemaByType;
    return isValid ? [...acc, convert(schemaByType, value)] : acc;
  }, []);
  return isUndefined(mapped) || !mapped.length ? scope.fallback : mapped;
};
