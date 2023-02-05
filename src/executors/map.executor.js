import { isUndefined } from "../utils.js";
import { convert } from "../index.js";

export const mapExecutor = (scope, values) => {
  const mapped = values?.map((value) =>
    convert(scope.childSchema, value)
  );
  return isUndefined(mapped) ? scope.fallback() : mapped;
};
