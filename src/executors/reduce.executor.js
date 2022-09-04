import { convert } from "../convert";

export const reduceExecutor = (scope, values) => {
  return values?.reduce(
    (acc, item, index) => ({
      ...acc,
      [scope.predicate(item)]: convert(
        scope.childSchema,
        item,
        scope.errorStorage,
        [...scope.prefixes, scope.keys[0], index]
      ),
    }),
    {}
  );
};
