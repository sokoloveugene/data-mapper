import { convert } from "../index";
import { TScope } from "../types";

export const reduceExecutor = (scope: TScope, values: unknown[]) => {
  return values?.reduce(
    (acc: Record<string, unknown>, item) => ({
      ...acc,
      [scope.predicate(item)]: convert(scope.childSchema!, item),
    }),
    {}
  );
};
