import { MODE } from "../utils";
import { defaultExecutor } from "./default.executor";
import { applyExecutor } from "./apply.executor";
import { mapExecutor } from "./map.executor";
import { mapWhenExecutor } from "./map-when.executor";
import { switchExecutor } from "./switch.executor";
import { switchMapExecutor } from "./switch-map.executor";
import { reduceExecutor } from "./reduce.executor";

export const EXECUTORS = {
  [MODE.DEFAULT]: defaultExecutor,
  [MODE.APPLY]: applyExecutor,
  [MODE.MAP]: mapExecutor,
  [MODE.MAP_WHEN]: mapWhenExecutor,
  [MODE.SWITCH]: switchExecutor,
  [MODE.SWITCH_MAP]: switchMapExecutor,
  [MODE.REDUCE]: reduceExecutor,
};
