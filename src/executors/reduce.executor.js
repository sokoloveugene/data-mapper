import { convert } from "../index.js";

export const reduceExecutor = (scope, values) => {
  return values?.reduce(
    (acc, item) => ({
      ...acc,
      [scope.predicate(item)]: convert(scope.childSchema, item),
    }),
    {}
  );
};
