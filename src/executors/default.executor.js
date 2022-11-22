import { isUndefined } from "../utils.js";

export const defaultExecutor = (scope, value) => {
  return isUndefined(value) ? scope.fallback : value;
};
