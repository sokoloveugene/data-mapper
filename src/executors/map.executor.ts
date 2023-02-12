import { isUndefined } from "../utils";
import { convert } from "../index";
import { TScope } from "../types";

export const mapExecutor = (scope: TScope, values: unknown[]) => {
  const mapped = values?.map((value) => convert(scope.childSchema!, value));
  return isUndefined(mapped) ? scope.fallback() : mapped;
};
