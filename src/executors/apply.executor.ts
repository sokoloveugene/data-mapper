import { convert } from "../index";
import { TOptions, TScope } from "../types";
import { dummy } from "../utils";
import { mapWhenExecutor } from "./map-when.executor";
import { mapExecutor } from "./map.executor";

export const applyExecutor = (
  scope: TScope,
  value: unknown,
  options: TOptions
) => {
  if (scope.each) {
    const hasFilter = scope.filter !== dummy;
    const executor = hasFilter ? mapWhenExecutor : mapExecutor;
    return executor(scope, value as unknown[], options);
  }
  return convert(scope.childSchema!, value, options);
};
