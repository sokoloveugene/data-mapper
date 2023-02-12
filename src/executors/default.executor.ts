import { TScope } from "../types";
import { isUndefined } from "../utils";

export const defaultExecutor = (scope: TScope, value: unknown) => {
  return isUndefined(value) ? scope.fallback() : value;
};
