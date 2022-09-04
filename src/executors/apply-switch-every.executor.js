import { isUndefined } from "../utils";
import { convert } from "../convert";

export const applySwitchEveryExecutor = (scope, values) => {
  const mapped = values?.reduce((acc, value, index) => {
    const type = scope.predicate(value);
    const schemaByType = scope.switchMap[type];
    const isValid = !!schemaByType;
    return isValid
      ? [
          ...acc,
          convert(schemaByType, value, scope.errorStorage, [
            ...scope.prefixes,
            scope.keys[0],
            index,
          ]),
        ]
      : acc;
  }, []);
  return isUndefined(mapped) || !mapped.length ? scope.fallback : mapped;
};
