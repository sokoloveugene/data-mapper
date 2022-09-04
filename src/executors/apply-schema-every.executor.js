import { isUndefined } from "../utils";
import { convert } from "../convert";

export const applySchemaEveryExecutor = (scope, values) => {
  const mapped = values?.map((value, index) =>
    convert(scope.childSchema, value, scope.errorStorage, [
      ...scope.prefixes,
      scope.keys[0],
      index,
    ])
  );
  return isUndefined(mapped) ? scope.fallback : mapped;
};
