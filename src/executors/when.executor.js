import { isUndefined } from "../utils.js";
import { convert } from "../index.js";

export const whenExecutor = (scope, values) => {
  const mapped = values?.reduce((acc, value) => {
    const isValid = scope.predicate(value);
    return isValid ? [...acc, convert(scope.childSchema, value)] : acc;
  }, []);
  return isUndefined(mapped) || !mapped.length ? scope.fallback : mapped;
};
