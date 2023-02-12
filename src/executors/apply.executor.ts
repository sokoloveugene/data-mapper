import { convert } from "../index";
import { TScope } from "../types";

export const applyExecutor = (scope: TScope, value: unknown) => {
  return convert(scope.childSchema!, value);
};
