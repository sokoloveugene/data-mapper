import { isUndefined } from "../utils";
import { convert } from "../index";
import { TOptions, TScope } from "../types";

export const mapWhenExecutor = (
  scope: TScope,
  values: unknown[],
  options: TOptions
) => {
  const mapped = (values ?? []).reduce((acc: unknown[], value): unknown[] => {
    const isValid = scope.predicate(value);
    return isValid
      ? [...acc, convert(scope.childSchema!, value, options)]
      : acc;
  }, []);
  return isUndefined(mapped) || !mapped.length ? scope.fallback() : mapped;
};
