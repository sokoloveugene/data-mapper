import { convert } from "../index.js";

export const applyExecutor = (scope, value) => {
  return convert(scope.childSchema, value);
};
