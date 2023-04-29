import { isUndefined } from "../utils";
import { convert } from "../index";
import { TOptions, TScope } from "../types";

export const switchMapExecutor = (
  scope: TScope,
  values: unknown[],
  options: TOptions
) => {
  const mapped = values?.reduce((acc: unknown[], value) => {
    const type = scope.predicate(value);
    const schemaByType = scope.switchMap?.[type];
    const isValid = !!schemaByType;
    return isValid ? [...acc, convert(schemaByType, value, options)] : acc;
  }, []);
  return isUndefined(mapped) || !mapped.length ? scope.fallback() : mapped;
};
