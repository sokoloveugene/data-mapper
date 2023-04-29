import { convert } from "../index";
import { TOptions, TScope } from "../types";

export const applyExecutor = (
  scope: TScope,
  value: unknown,
  options: TOptions
) => {
  return convert(scope.childSchema!, value, options);
};
