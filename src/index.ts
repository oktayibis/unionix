/**
 * unionix - A type-safe TypeScript library for working with discriminated unions
 */

/**
 * Discriminated union base type - requires a readonly 'type' property
 */
export type DiscriminatedUnion = {
  readonly type: string;
};

/**
 * Extract the discriminator type(s) from a union
 */
export type ExtractDiscriminator<T extends DiscriminatedUnion> = T extends {
  readonly type: infer U;
}
  ? U
  : never;

/**
 * Extract a specific variant from a union by its discriminator value
 */
export type ExtractVariant<
  Union extends DiscriminatedUnion,
  Type extends ExtractDiscriminator<Union>,
> = Union extends { readonly type: Type } ? Union : never;

/**
 * Type guard functions for each variant
 * Uses TypeScript's intrinsic Capitalize utility type
 */
export type TypeGuards<Union extends DiscriminatedUnion> = {
  [K in ExtractDiscriminator<Union> as `is${Capitalize<string & K>}`]: (
    value: Union,
  ) => value is ExtractVariant<Union, K>;
};

/**
 * Map handlers - partial handlers that transform variants and return the same union type
 */
export type MapHandlers<Union extends DiscriminatedUnion> = {
  [K in ExtractDiscriminator<Union>]?: (
    value: ExtractVariant<Union, K>,
  ) => ExtractVariant<Union, K>;
};

/**
 * Transform handlers - partial handlers that can transform a variant into any variant of the union
 */
export type TransformHandlers<Union extends DiscriminatedUnion> = {
  [K in ExtractDiscriminator<Union>]?: (
    value: ExtractVariant<Union, K>,
  ) => Union;
};

/**
 * When handlers - exhaustive pattern matching with consistent return type
 */
export type WhenHandlers<Union extends DiscriminatedUnion, R> = {
  [K in ExtractDiscriminator<Union>]: (value: ExtractVariant<Union, K>) => R;
};

/**
 * Match handlers - exhaustive pattern matching that transforms to a different type
 */
export type MatchHandlers<Union extends DiscriminatedUnion, R> = {
  [K in ExtractDiscriminator<Union>]: (value: ExtractVariant<Union, K>) => R;
};

/**
 * Fold handlers - similar to match but with explicit default case
 */
export type FoldHandlers<Union extends DiscriminatedUnion, R> = {
  [K in ExtractDiscriminator<Union>]?: (value: ExtractVariant<Union, K>) => R;
};

/**
 * Filter predicate for a specific variant type
 */
export type FilterPredicate<T> = (value: T) => boolean;

const createMapFunction = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union>["map"] => {
  return (value, handlers) => {
    const key = value.type as ExtractDiscriminator<Union>;
    const handler = handlers[key];
    if (handler) {
      return handler(value as ExtractVariant<Union, typeof key>) as Union;
    }
    return value;
  };
};

const createTransformFunction = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union>["transform"] => {
  return (value, handlers) => {
    const key = value.type as ExtractDiscriminator<Union>;
    const handler = handlers[key];
    if (handler) {
      return handler(value as ExtractVariant<Union, typeof key>);
    }
    return value;
  };
};

const createWhenFunction = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union>["when"] => {
  return (value, handlers) => {
    const key = value.type as ExtractDiscriminator<Union>;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(`No handler found for type: ${value.type}`);
    }
    return handler(value as ExtractVariant<Union, typeof key>);
  };
};

const createMatchFunction = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union>["match"] => {
  return (value, handlers) => {
    const key = value.type as ExtractDiscriminator<Union>;
    const handler = handlers[key];
    if (!handler) {
      throw new Error(`No handler found for type: ${value.type}`);
    }
    return handler(value as ExtractVariant<Union, typeof key>);
  };
};

const createFilterFunction = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union>["filter"] => {
  return <K extends ExtractDiscriminator<Union>>(
    values: readonly Union[],
    types: K | readonly K[],
  ): Array<ExtractVariant<Union, K>> => {
    const allowedTypes = new Set(Array.isArray(types) ? types : [types]);
    return values.filter((value): value is ExtractVariant<Union, K> =>
      allowedTypes.has(value.type as K),
    ) as Array<ExtractVariant<Union, K>>;
  };
};

const createFilterByFunction = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union>["filterBy"] => {
  return <K extends ExtractDiscriminator<Union>>(
    values: readonly Union[],
    predicates: {
      [P in K]: FilterPredicate<ExtractVariant<Union, P>>;
    },
  ): Array<ExtractVariant<Union, K>> => {
    const allowedTypes = new Set(Object.keys(predicates));
    return values.filter((value): value is ExtractVariant<Union, K> => {
      if (allowedTypes.has(value.type)) {
        const predicate = predicates[value.type as K];
        return predicate ? predicate(value as ExtractVariant<Union, K>) : false;
      }
      return false;
    }) as Array<ExtractVariant<Union, K>>;
  };
};

const createFoldFunction = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union>["fold"] => {
  return (value, handlers, defaultHandler) => {
    const key = value.type as ExtractDiscriminator<Union>;
    const handler = handlers[key];
    if (handler) {
      return handler(value as ExtractVariant<Union, typeof key>);
    }
    return defaultHandler(value);
  };
};

const createPartitionFunction = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union>["partition"] => {
  return (values) => {
    const result = {} as {
      [K in ExtractDiscriminator<Union>]: Array<ExtractVariant<Union, K>>;
    };

    for (const value of values) {
      const key = value.type as ExtractDiscriminator<Union>;
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(value as ExtractVariant<Union, typeof key>);
    }

    return result;
  };
};

const createGetTypeFunction = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union>["getType"] => {
  return (value) => value.type as ExtractDiscriminator<Union>;
};

const createConstructorFunction = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union>["constructor"] => {
  return <K extends ExtractDiscriminator<Union>>(type: K) => {
    return <T extends ExtractVariant<Union, K>>(data: Omit<T, "type">): T =>
      ({ ...data, type }) as T;
  };
};

const createHelpersCore = <
  Union extends DiscriminatedUnion,
>(): UnionHelpersCore<Union> => ({
  map: createMapFunction<Union>(),
  transform: createTransformFunction<Union>(),
  when: createWhenFunction<Union>(),
  match: createMatchFunction<Union>(),
  filter: createFilterFunction<Union>(),
  filterBy: createFilterByFunction<Union>(),
  fold: createFoldFunction<Union>(),
  partition: createPartitionFunction<Union>(),
  getType: createGetTypeFunction<Union>(),
  constructor: createConstructorFunction<Union>(),
});

const uncapitalize = (str: string): string =>
  str.charAt(0).toLowerCase() + str.slice(1);

/**
 * UnionHelpers core methods (without type guards)
 */
export interface UnionHelpersCore<Union extends DiscriminatedUnion> {
  /**
   * Map over a union value, applying transformations only to specified variants.
   * Unhandled variants are returned unchanged.
   *
   * @param value - The union value to map
   * @param handlers - Partial handlers for transforming specific variants
   * @returns The transformed union value
   *
   * @example
   * const result = helpers.map(value, {
   *   AType: (a) => ({ ...a, data: a.data.toUpperCase() })
   * });
   */
  map(value: Union, handlers: MapHandlers<Union>): Union;

  /**
   * Transform a union value, allowing variants to be converted to other variants.
   * Unhandled variants are returned unchanged.
   *
   * @param value - The union value to transform
   * @param handlers - Partial handlers that can return any variant of the union
   * @returns The transformed union value
   *
   * @example
   * const result = helpers.transform(value, {
   *   AType: (a) => ({ type: 'BType', data: a.data.length })
   * });
   */
  transform(value: Union, handlers: TransformHandlers<Union>): Union;

  /**
   * Exhaustive pattern matching with a consistent return type.
   * All variants must be handled.
   *
   * @param value - The union value to match
   * @param handlers - Exhaustive handlers for all variants
   * @returns The result of applying the appropriate handler
   *
   * @example
   * const result = helpers.when(value, {
   *   AType: (a) => a.data.length > 5,
   *   BType: (b) => b.data > 10
   * });
   */
  when<R>(value: Union, handlers: WhenHandlers<Union, R>): R;

  /**
   * Match and transform a union value to a different type.
   * Similar to when, but emphasizes type transformation.
   *
   * @param value - The union value to match
   * @param handlers - Exhaustive handlers for all variants
   * @returns The transformed result
   *
   * @example
   * const result = helpers.match(value, {
   *   AType: (a) => ({ status: 'text', content: a.data }),
   *   BType: (b) => ({ status: 'number', content: b.data.toString() })
   * });
   */
  match<R>(value: Union, handlers: MatchHandlers<Union, R>): R;

  /**
   * Filter an array of union values, keeping only specified variant types.
   *
   * @param values - Array of union values
   * @param types - Single type or array of types to keep
   * @returns Filtered array containing only the specified variant types
   *
   * @example
   * const onlyBTypes = helpers.filter(values, 'BType');
   * const aAndB = helpers.filter(values, ['AType', 'BType']);
   */
  filter<K extends ExtractDiscriminator<Union>>(
    values: readonly Union[],
    types: K | readonly K[],
  ): Array<ExtractVariant<Union, K>>;

  /**
   * Filter an array of union values with custom predicates for each type.
   *
   * @param values - Array of union values
   * @param predicates - Object mapping variant types to filter predicates
   * @returns Filtered array containing only matching variants
   *
   * @example
   * const filtered = helpers.filterBy(values, {
   *   BType: (b) => b.data > 5,
   *   AType: (a) => a.data.length > 3
   * });
   */
  filterBy<K extends ExtractDiscriminator<Union>>(
    values: readonly Union[],
    predicates: {
      [P in K]: FilterPredicate<ExtractVariant<Union, P>>;
    },
  ): Array<ExtractVariant<Union, K>>;

  /**
   * Fold over a union value with optional handlers and a default case.
   *
   * @param value - The union value
   * @param handlers - Partial handlers for specific variants
   * @param defaultHandler - Handler for unhandled variants
   * @returns The result of applying the appropriate handler
   *
   * @example
   * const result = helpers.fold(
   *   value,
   *   { AType: (a) => a.data.length },
   *   () => 0
   * );
   */
  fold<R>(
    value: Union,
    handlers: FoldHandlers<Union, R>,
    defaultHandler: (value: Union) => R,
  ): R;

  /**
   * Partition an array of unions into groups by variant type.
   *
   * @param values - Array of union values
   * @returns Object with discriminator values as keys and arrays of matching variants as values
   *
   * @example
   * const partitioned = helpers.partition(values);
   * // { AType: [...], BType: [...] }
   */
  partition(values: readonly Union[]): {
    [K in ExtractDiscriminator<Union>]: Array<ExtractVariant<Union, K>>;
  };

  /**
   * Get the discriminator value from a union instance.
   *
   * @param value - The union value
   * @returns The discriminator value
   */
  getType(value: Union): ExtractDiscriminator<Union>;

  /**
   * Create a type-safe constructor function for a specific variant.
   *
   * @param type - The discriminator value
   * @returns A function that creates instances of the specified variant
   *
   * @example
   * const createA = helpers.constructor('AType');
   * const a = createA({ data: 'hello' });
   */
  constructor<K extends ExtractDiscriminator<Union>>(
    type: K,
  ): <T extends ExtractVariant<Union, K>>(data: Omit<T, "type">) => T;
}

/**
 * UnionHelpers combines core methods with type guards
 */
export type UnionHelpers<Union extends DiscriminatedUnion> =
  UnionHelpersCore<Union> & TypeGuards<Union>;

/**
 * Create a set of type-safe helpers for working with a discriminated union.
 *
 * @returns An object containing helper methods for the union type
 *
 * @example
 * type MyUnion = AType | BType;
 * const helpers = create<MyUnion>();
 *
 * if (helpers.isAType(value)) {
 *   // value is narrowed to AType
 * }
 */
export function create<
  Union extends DiscriminatedUnion,
>(): UnionHelpers<Union> {
  const core = createHelpersCore<Union>();
  const typeGuardCache = new Map<string, (value: Union) => boolean>();

  return new Proxy(core as UnionHelpers<Union>, {
    get(target, prop: string | symbol, receiver) {
      if (typeof prop === "string" && prop.startsWith("is")) {
        const cached = typeGuardCache.get(prop);
        if (cached) {
          return cached;
        }

        const typeName = prop.slice(2);
        const typeGuard = (value: Union): boolean => {
          return (
            value.type === uncapitalize(typeName) || value.type === typeName
          );
        };

        typeGuardCache.set(prop, typeGuard);
        return typeGuard;
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}

/**
 * Default export
 */
export default create;
