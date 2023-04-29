import { isUndefined } from "../utils";
import { convert } from "../index";
import { TOptions, TScope } from "../types";

export const mapExecutor = (
  scope: TScope,
  values: unknown[],
  options: TOptions
) => {
  const mapped = values?.map((value) =>
    convert(scope.childSchema!, value, options)
  );
  return isUndefined(mapped) ? scope.fallback() : mapped;
};
