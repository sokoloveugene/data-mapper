import { isUndefined } from "../utils";
import { convert } from "../index";
import { TOptions, TScope } from "../types";
import { switchMapExecutor } from "./switch-map.executor";

export const switchExecutor = (
  scope: TScope,
  value: unknown,
  options: TOptions
) => {
  if (scope.each) {
    return switchMapExecutor(scope, value as unknown[], options);
  }
  const type = scope.keygen(value);
  const schemaByType = (scope.childSchema ?? {})[type];
  const result = schemaByType
    ? convert(schemaByType, value, options)
    : undefined;
  return isUndefined(result) ? scope.fallback() : result;
};
