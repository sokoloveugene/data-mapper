import { isUndefined } from "../utils";
import { convert } from "../index";
import { TScope } from "../types";

export const switchExecutor = (scope: TScope, value: unknown) => {
  const type = scope.predicate(value);
  const schemaByType = scope.switchMap[type];
  const result = schemaByType ? convert(schemaByType, value) : undefined;
  return isUndefined(result) ? scope.fallback() : result;
};
