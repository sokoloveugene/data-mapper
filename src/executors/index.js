import { MODE } from "../utils.js";
import { defaultExecutor } from "./default.executor.js";
import { applyExecutor } from "./apply.executor.js";
import { mapExecutor } from "./map.executor.js";
import { whenExecutor } from "./when.executor.js";
import { switchExecutor } from "./switch.executor.js";
import { switchAllExecutor } from "./switch-all.executor.js";
import { reduceExecutor } from "./reduce.executor.js";

export const EXECUTORS = {
  [MODE.DEFAULT]: defaultExecutor,
  [MODE.APPLY]: applyExecutor,
  [MODE.MAP]: mapExecutor,
  [MODE.WHEN]: whenExecutor,
  [MODE.SWITCH]: switchExecutor,
  [MODE.APPLY_SWITCH_EVERY]: switchAllExecutor,
  [MODE.REDUCE]: reduceExecutor,
};
