import { dummy, isUndefined } from "../utils";
import { convert } from "../index";
import { TOptions, TScope } from "../types";

export const switchMapExecutor = (
  scope: TScope,
  values: unknown[],
  options: TOptions
) => {
  const mapped = values?.reduce((acc: unknown[], value) => {
    if (scope.filter !== dummy && !scope.filter(value)) return acc;
    const type = scope.keygen(value);
    const schemaByType = (scope.childSchema ?? {})?.[type];
    const isValid = !!schemaByType;
    return isValid ? [...acc, convert(schemaByType, value, options)] : acc;
  }, []);
  return isUndefined(mapped) || !mapped.length ? scope.fallback() : mapped;
};
