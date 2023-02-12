import {
  _getChildTypeDefinition,
  _getRootTypeDefinition,
} from "./generator.js";
import { TScope, TMappingSchema, TConstructor } from "./types.js";
import { dummy, MODE } from "./utils.js";

export class Scope implements TScope {
  mode: string;
  keys: string[];
  actions: Function[];
  fallback: Function;
  childSchema?: TMappingSchema;
  switchMap: Record<string, TMappingSchema>;
  predicate: Function;
  type?: TConstructor;

  constructor() {
    this.mode = MODE.DEFAULT;
    this.keys = [];
    this.actions = [];
    this.fallback = dummy;
    this.childSchema = undefined;
    this.switchMap = {};
    this.predicate = dummy;
    this.type = undefined;
  }

  withActions(initial: any) {
    return this.actions.reduce((composed, f) => [f(...composed)], initial)[0];
  }

  getTypeDefinition() {
    return {
      type: _getRootTypeDefinition(this),
      optional: this.fallback === dummy,
      child: _getChildTypeDefinition(this),
    };
  }
}
