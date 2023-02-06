import { getChildTypeDefinition, getRootTypeDefinition } from "./generator.js";
import { dummy, MODE } from "./utils.js";

export class Scope {
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

  withActions(initial) {
    return this.actions.reduce((composed, f) => [f(...composed)], initial)[0];
  }

  getTypeDefinition() {
    return {
      type: getRootTypeDefinition(this),
      optional: this.fallback === dummy,
      child: getChildTypeDefinition(this),
    };
  }
}
