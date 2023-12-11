type Fn = (...args: any[]) => any;

type ObjectValues<T> = {
  [Key in keyof T]: T[Key];
}[keyof T];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type MergedType<T> = {
  [K in keyof UnionToIntersection<T>]: T extends Record<K, infer U> ? U : never;
};

type Deep<T> = {
  [K in keyof T as K extends `${infer P}.${infer R}`
    ? P
    : K]: K extends `${infer P}.${infer R}` ? Deep<{ [Q in R]: T[K] }> : T[K];
};

type Spread<T> = {
  [K in keyof T]: K extends `...${string}` ? Omit<T, K> & T[K] : T[K];
};

type IsNeverType<T> = [T] extends [never] ? true : false;

type IsAnyType<T> = 0 extends 1 & T ? true : false;

type AnyConvert = Convert<any>;

type Schema<T> = {
  [K in keyof T]: T[K] extends AnyConvert
    ? ReturnType<T[K]["from"]>
    : MergedType<Schema<T[K]>>;
};

const definitelyArray = (value: unknown) => (Array.isArray(value) ? value : []);

const applyModifiers = (fns: Fn[]) => {
  return (values: unknown[]) =>
    fns.reduce((composed, f) => [f(...composed)], values);
};

function dummy(v: unknown) {
  return v;
}

function bypassTrue() {
  return true;
}

function nullOrUndefined(value: unknown) {
  return value === undefined || value === null;
}

function compact(value: unknown) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function toPath(input: string) {
  return compact(input.replace(/["|']|\]/g, "").split(/\.|\[/));
}

function isObject(value: unknown) {
  return Boolean(value) && typeof value === "object";
}

function set<D = any>(obj: unknown, path: string, value: D) {
  const isKey = (value: string) => /^\w*$/.test(value);
  let index = -1;
  const tempPath = isKey(path) ? [path] : toPath(path);
  const length = tempPath.length;
  const lastIndex = length - 1;
  while (++index < length) {
    const key = tempPath[index];
    let newValue = value;
    if (index !== lastIndex) {
      // @ts-ignore
      const objValue = obj[key];
      newValue =
        isObject(objValue) || Array.isArray(objValue)
          ? objValue
          : !isNaN(+tempPath[index + 1])
          ? []
          : {};
    }
    // @ts-ignore
    obj[key] = newValue;
    // @ts-ignore
    obj = obj[key];
  }
  return obj;
}

function get<D = any>(obj: unknown, path: string, defaultValue?: D): D {
  if (!isObject(obj)) return defaultValue as D;
  const chunks = path.split(/[,[\].]+?/).filter(Boolean);
  let result = obj;
  for (const chunk of chunks) {
    if (result === null || result === undefined) break;
    // @ts-ignore
    result = result[chunk];
  }
  return (result === undefined ? defaultValue : result) as D;
}

type State = {
  switch: boolean;
  case: Fn;
  each?: Fn;
  paths: string[];
  type?: Fn;
  modifiers: Fn[];
  fallback: Fn;
  child?: Record<string, AnyConvert | Record<string, AnyConvert>>;
};

type Determine<First, Second> = IsNeverType<First> extends true
  ? Second
  : IsAnyType<First> extends true
  ? Second
  : First | Second;

export type SchemaValue<T> = Schema<Deep<T>>;

class Convert<Current> {
  constructor(private state: State) {}

  setPath(path: string) {
    if (this.state.paths.length) return;
    this.state.paths.push(path);
  }

  fallback<T>(value: T) {
    this.state.fallback = () => (typeof value === "function" ? value() : value);
    return new Convert<Determine<Current, T>>(this.state);
  }

  type<T extends Fn>(fn: T) {
    this.state.type = fn;
    return new Convert<Determine<Current, ReturnType<T>>>(this.state);
  }

  pipe<T extends Fn>(fn: T) {
    this.state.modifiers.push(fn);
    return new Convert<Determine<Current, ReturnType<T>>>(this.state);
  }

  apply<T extends Record<string, AnyConvert>>(child: T) {
    this.state.child = child;
    return new Convert<Determine<Current, SchemaValue<T>>>(this.state);
  }

  switch<T extends Record<string, Record<string, AnyConvert>>>(child: T) {
    this.state.child = child;
    this.state.switch = true;
    return new Convert<
      Determine<Current, SchemaValue<MergedType<ObjectValues<T>>>>
    >(this.state);
  }

  case<T extends Fn>(fn: T) {
    this.state.case = fn;
    return new Convert<Current>(this.state);
  }

  each<T extends Fn>(fn?: T) {
    this.state.each = fn ?? bypassTrue;
    return new Convert<Current[]>(this.state);
  }

  from(input: unknown, context: unknown): Current {
    const { fallback, paths, modifiers, child, each } = this.state;
    const data = applyModifiers(modifiers)(
      paths.map((key) => {
        return key.startsWith("$")
          ? get(context, key.slice(2))
          : get(input, key);
      })
    ).at(0);

    if (this.state.switch) {
      if (!child) throw new Error("Switch options are not found");
      const key = this.state.case(data);
      const schema = child[String(key)] as Record<string, AnyConvert>;
      if (!schema) return fallback() as Current;
      if (!each) return convert({ schema, data, context }) as Current;
      return definitelyArray(data).reduce((acc, data) => {
        if (each(data)) {
          const key = this.state.case(data);
          const schema = child[String(key)] as Record<string, AnyConvert>;
          if (!schema) return acc;
          acc.push(convert({ schema, data, context }));
        }
        return acc;
      }, []) as Current;
    }

    if (child) {
      const schema = child as Record<string, AnyConvert>;
      if (!each) return convert({ schema, data, context }) as Current;
      return definitelyArray(data).reduce((acc, data) => {
        if (each(data)) acc.push(convert({ schema, data, context }));
        return acc;
      }, []) as Current;
    }

    const dataOrFallback = data === undefined ? fallback() : data;

    if (!this.state.type) return dataOrFallback as Current;

    const typeSafe = nullOrUndefined(dataOrFallback)
      ? dataOrFallback
      : this.state.type(dataOrFallback);

    return typeSafe as Current;
  }
}

type ConvertOptions<T extends Record<string, AnyConvert>> = {
  schema: T;
  data: unknown;
  context?: unknown;
};

export function convert<T extends Record<string, AnyConvert>>(
  options: ConvertOptions<T>
) {
  const output = {} as SchemaValue<T>;
  for (const [destination, converter] of Object.entries(options.schema)) {
    converter.setPath(destination);
    const result = converter.from(options.data, options.context);
    if (result !== undefined) set(output, destination, result);
  }
  return output as SchemaValue<T>;
}

export function pick<T = never>(...paths: string[]) {
  return new Convert<T>({
    switch: false,
    each: undefined,
    paths,
    fallback: dummy,
    case: dummy,
    modifiers: [],
  });
}
