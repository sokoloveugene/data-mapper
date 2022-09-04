import { convert } from "../convert";

export const applySchemaExecutor = (scope, value) => {
  return convert(scope.childSchema, value, scope.errorStorage, [
    ...scope.prefixes,
    scope.keys[0],
  ]);
};
