import { isUndefined } from "../utils";
import { convert } from "../convert";

export const applySwitchExecutor = (scope, value) => {
  const type = scope.predicate(value);
  const schemaByType = scope.switchMap[type];
  const result = schemaByType
    ? convert(schemaByType, value, scope.errorStorage, [
        ...scope.prefixes,
        scope.keys[0],
      ])
    : undefined;
  return isUndefined(result) ? scope.fallback : result;
};
