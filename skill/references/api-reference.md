# unionix API Reference

## `create<Union>()`

Creates a helper object with all utility methods for your discriminated union.

```typescript
import { create } from 'unionix';

type MyUnion = AType | BType;
const helpers = create<MyUnion>();
```

---

## Type Guards

Auto-generated for each variant as `is{CapitalizedType}`.

```typescript
// For type: 'loading' → isLoading
// For type: 'success' → isSuccess
// For type: 'AType' → isAType

if (helpers.isLoading(value)) {
  // value narrowed to Loading type
  console.log(value.progress);
}
```

---

## Pattern Matching

### `when(value, handlers)`

Exhaustive pattern matching. All variants must be handled. Compile-time error if a case is missing.

```typescript
const result = helpers.when(value, {
  loading: (s) => s.progress,
  success: (s) => 100,
  error: () => -1
}); // Returns number
```

### `match(value, handlers)`

Same as `when`, emphasizes transformation to a different type.

```typescript
const ui = helpers.match(state, {
  loading: (s) => ({ icon: 'spinner', text: `${s.progress}%` }),
  success: (s) => ({ icon: 'check', text: s.data }),
  error: (e) => ({ icon: 'x', text: e.message })
});
```

### `fold(value, handlers, defaultHandler)`

Partial matching with default fallback. Only handle variants you care about.

```typescript
const progress = helpers.fold(
  state,
  { loading: (s) => s.progress },
  () => 0 // default for success/error
);
```

---

## Transformation

### `map(value, handlers)`

Transform variants while keeping the same type. Unhandled variants returned unchanged.

```typescript
// Double progress for loading states
const updated = helpers.map(state, {
  loading: (s) => ({ ...s, progress: s.progress * 2 })
});
// success/error returned as-is
```

### `transform(value, handlers)`

Convert variants to different variants. Unhandled variants returned unchanged.

```typescript
// Convert error back to loading (retry)
const retried = helpers.transform(state, {
  error: () => ({ type: 'loading', progress: 0 })
});
```

---

## Filtering

### `filter(values, types)`

Keep only specified variant types from an array.

```typescript
const states: State[] = [...];

// Single type
const loadingOnly = helpers.filter(states, 'loading');
// Returns Loading[]

// Multiple types
const completed = helpers.filter(states, ['success', 'error']);
// Returns (Success | Error)[]
```

### `filterBy(values, predicates)`

Filter with custom predicates per type.

```typescript
const filtered = helpers.filterBy(states, {
  loading: (s) => s.progress > 50,
  error: (e) => e.message.includes('timeout')
});
// Returns only matching Loading and Error items
```

---

## Aggregation

### `partition(values)`

Group array by variant type.

```typescript
const grouped = helpers.partition(states);
// Returns: { loading: Loading[], success: Success[], error: Error[] }

console.log(grouped.loading.length); // count of loading states
```

---

## Utilities

### `getType(value)`

Extract the discriminator value.

```typescript
const type = helpers.getType(state);
// Returns: 'loading' | 'success' | 'error'
```

### `constructor(type)`

Create a type-safe constructor for a variant.

```typescript
const createLoading = helpers.constructor('loading');
const state = createLoading({ progress: 0 });
// Returns: { type: 'loading', progress: 0 }

const createSuccess = helpers.constructor('success');
const done = createSuccess({ data: 'result' });
// Returns: { type: 'success', data: 'result' }
```

---

## Type Definitions

```typescript
// Union must have readonly type field
type DiscriminatedUnion = { readonly type: string };

// Extract discriminator values
type ExtractDiscriminator<T> = T extends { readonly type: infer U } ? U : never;

// Extract specific variant
type ExtractVariant<Union, Type> = Union extends { readonly type: Type } ? Union : never;
```
