import { convert } from "../index";
import { TOptions, TScope } from "../types";

export const reduceExecutor = (
  scope: TScope,
  values: unknown[],
  options: TOptions
) => {
  return values?.reduce(
    (acc: Record<string, unknown>, item) => ({
      ...acc,
      [scope.predicate(item)]: convert(scope.childSchema!, item, options),
    }),
    {}
  );
};
