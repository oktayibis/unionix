---
name: unionix
description: |
  Type-safe discriminated union utilities for TypeScript. Use when working with discriminated unions (tagged unions/sum types), pattern matching, type guards, or union transformations. Triggers: "discriminated union", "tagged union", "pattern matching", "type guard", "unionix", "when/match/fold", "filter union", "partition union", "transform union".
---

# unionix

Type-safe TypeScript library for discriminated unions with pattern matching, auto-generated type guards, and transformation utilities.

## Installation

```bash
npm install unionix
```

## Quick Start

```typescript
import { create } from 'unionix';

// 1. Define discriminated union (requires readonly type field)
interface Loading { readonly type: 'loading'; readonly progress: number; }
interface Success { readonly type: 'success'; readonly data: string; }
interface Error { readonly type: 'error'; readonly message: string; }

type State = Loading | Success | Error;

// 2. Create helpers
const state = create<State>();

// 3. Use helpers
const current: State = { type: 'loading', progress: 50 };

// Type guard (auto-generated as is{CapitalizedType})
if (state.isLoading(current)) {
  console.log(current.progress); // TypeScript knows it's Loading
}

// Pattern matching
const message = state.when(current, {
  loading: (s) => `Loading ${s.progress}%`,
  success: (s) => `Done: ${s.data}`,
  error: (e) => `Error: ${e.message}`
});
```

## API Quick Reference

| Method | Purpose | Exhaustive? |
|--------|---------|-------------|
| `is{Type}(value)` | Type guard for narrowing | N/A |
| `when(value, handlers)` | Pattern match, return value | Yes |
| `match(value, handlers)` | Pattern match, transform | Yes |
| `fold(value, handlers, default)` | Partial match with fallback | No |
| `map(value, handlers)` | Transform within same variant | No |
| `transform(value, handlers)` | Convert between variants | No |
| `filter(values, types)` | Keep only specified types | N/A |
| `filterBy(values, predicates)` | Filter with conditions | N/A |
| `partition(values)` | Group array by type | N/A |
| `getType(value)` | Get discriminator value | N/A |
| `constructor(type)` | Create variant constructor | N/A |

## When to Use Each Method

**Exhaustive handling (compile-time safety):**
- `when` - Return a value based on variant type
- `match` - Transform to a different type

**Partial handling:**
- `fold` - Handle some cases, provide default
- `map` - Modify variant, keep same type
- `transform` - Convert variant to different variant

**Collections:**
- `filter` - Keep only certain types
- `filterBy` - Filter with predicates per type
- `partition` - Group by type

**Utilities:**
- `is{Type}` - Type narrowing in conditionals
- `constructor` - Create instances without repeating `type`
- `getType` - Extract discriminator

## Detailed API

See [references/api-reference.md](references/api-reference.md) for complete method signatures and examples.

## Common Patterns

See [references/patterns.md](references/patterns.md) for real-world patterns:
- State machines (loading/success/error)
- Event handling systems
- API response handling
- Order/workflow lifecycles

## Best Practices

1. **Use `readonly`** for all union properties to prevent mutations
2. **Prefer `when`** for exhaustive handling (compiler ensures all cases covered)
3. **Use `fold`** when only handling specific variants with sensible default
4. **Leverage type guards** (`is{Type}`) for conditional narrowing
