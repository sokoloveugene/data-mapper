import { isUndefined } from "../utils";
import { convert } from "../index";
import { TOptions, TScope } from "../types";

export const switchExecutor = (
  scope: TScope,
  value: unknown,
  options: TOptions
) => {
  const type = scope.predicate(value);
  const schemaByType = scope.switchMap[type];
  const result = schemaByType
    ? convert(schemaByType, value, options)
    : undefined;
  return isUndefined(result) ? scope.fallback() : result;
};
