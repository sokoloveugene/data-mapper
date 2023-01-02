import { dummy, MODE } from "./utils";

export class Scope {
  constructor() {
    this.mode = MODE.DEFAULT;
    this.keys = [];
    this.actions = [];
    this.fallback = undefined;
    this.childSchema = undefined;
    this.switchMap = {};
    this.predicate = dummy;
  }

  withActions(initial) {
    return this.actions.reduce((composed, f) => [f(...composed)], initial)[0];
  }
}
