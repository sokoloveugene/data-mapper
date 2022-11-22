import { isUndefined } from "../utils.js";
import { convert } from "../index.js";

export const switchExecutor = (scope, value) => {
  const type = scope.predicate(value);
  const schemaByType = scope.switchMap[type];
  const result = schemaByType ? convert(schemaByType, value) : undefined;
  return isUndefined(result) ? scope.fallback : result;
};
