import { isUndefined } from "../utils";

export const defaultExecutor = (scope, value) => {
  return isUndefined(value) ? scope.fallback : value;
};
