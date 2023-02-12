import { isUndefined } from "../utils";
import { convert } from "../index";
import { TScope } from "../types";

export const mapWhenExecutor = (scope: TScope, values: unknown[]) => {
  const mapped = (values ?? []).reduce((acc: unknown[], value): unknown[] => {
    const isValid = scope.predicate(value);
    return isValid ? [...acc, convert(scope.childSchema!, value)] : acc;
  }, []);
  return isUndefined(mapped) || !mapped.length ? scope.fallback() : mapped;
};
