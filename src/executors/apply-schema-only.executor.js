import { isUndefined } from "../utils";
import {convert} from "../convert";

export const applySchemaOnlyExecutor = (scope, values) => {
  const mapped = values?.reduce((acc, value, index) => {
    const isValid = scope.predicate(value);
    return isValid
      ? [
          ...acc,
          convert(scope.childSchema, value, scope.errorStorage, [
            ...scope.prefixes,
            scope.keys[0],
            index,
          ]),
        ]
      : acc;
  }, []);
  return isUndefined(mapped) || !mapped.length ? scope.fallback : mapped;
};
