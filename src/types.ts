export interface TScope {
  mode: string;
  keys: string[];
  actions: Function[];
  fallback: Function;
  childSchema?: TMappingSchema;
  switchMap: Record<string, TMappingSchema>;
  predicate: Function;
  type?: TConstructor;
  withActions: (initial: any) => unknown;
}

export type TConstructor =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor;

export interface FieldMapper {
  type(constructor: TConstructor): this;
  pipe(...fns: Function[]): this;
  fallback<T>(value: T): this;
  apply(schema: TMappingSchema): this;
  map(schema: TMappingSchema): this;
  mapWhen(schema: TMappingSchema, predicate: Function): this;
  switch(switchMap: Record<string, TMappingSchema>, predicate: Function): this;
  switchMap(
    switchMap: Record<string, TMappingSchema>,
    predicat: Function
  ): this;
  reduce(predicate: Function, schema: TMappingSchema): this;
  _setDestination(path: string): this;
  _execute(data: unknown): Record<string, any>;
}

export type TMappingSchema = Record<string, FieldMapper>;
