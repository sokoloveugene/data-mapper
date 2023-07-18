import { MODE } from "../utils";
import { defaultExecutor } from "./default.executor";
import { applyExecutor } from "./apply.executor";
import { switchExecutor } from "./switch.executor";
import { reduceExecutor } from "./reduce.executor";

export const EXECUTORS = {
  [MODE.DEFAULT]: defaultExecutor,
  [MODE.APPLY]: applyExecutor,
  [MODE.SWITCH]: switchExecutor,
  [MODE.REDUCE]: reduceExecutor,
};
