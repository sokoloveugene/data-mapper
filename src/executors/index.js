import { MODE } from "../mode";

import { defaultExecutor } from "./default.executor";
import { applySchemaExecutor } from "./apply-schema.executor";
import { applySchemaEveryExecutor } from "./apply-schema-every.executor";
import { applySchemaOnlyExecutor } from "./apply-schema-only.executor";
import { applySwitchExecutor } from "./apply-switch.executor";
import { applySwitchEveryExecutor } from "./apply-switch-every.executor";
import { reduceExecutor } from "./reduce.executor";

export const EXECUTORS = {
  [MODE.DEFAULT]: defaultExecutor,
  [MODE.APPLY_SCHEMA]: applySchemaExecutor,
  [MODE.APPLY_SCHEMA_EVERY]: applySchemaEveryExecutor,
  [MODE.APPLY_SCHEMA_ONLY]: applySchemaOnlyExecutor,
  [MODE.APPLY_SWITCH]: applySwitchExecutor,
  [MODE.APPLY_SWITCH_EVERY]: applySwitchEveryExecutor,
  [MODE.REDUCE]: reduceExecutor,
};
