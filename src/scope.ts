import {
  _getChildTypeDefinition,
  _getRootTypeDefinition,
} from "./generator.js";
import { TScope, TMappingSchema, TConverter } from "./types.js";
import { dummy, MODE } from "./utils.js";

export class Scope implements TScope {
  mode: string;
  keys: string[];
  actions: TConverter[];
  fallback: Function;
  filter: Function;
  keygen: Function;
  each: boolean;
  childSchema?: TMappingSchema;
  type?: TConverter;

  constructor() {
    this.mode = MODE.DEFAULT;
    this.keys = [];
    this.actions = [];
    this.fallback = dummy;
    this.filter = dummy;
    this.keygen = dummy;
    this.each = false;
    this.childSchema = undefined;
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
