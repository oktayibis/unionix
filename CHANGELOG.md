# Changelog

## [1.1.0] - 2025-10-17

### Changed

- **BREAKING**: `filter()` now uses a simpler API - just pass type(s) to filter
  - Old: `filter(values, { BType: (b) => b.data > 10 })`
  - New: `filter(values, 'BType')` or `filter(values, ['AType', 'BType'])`

### Added

- `filterBy()` - New method for predicate-based filtering (replaces old `filter` functionality)
  - Use this when you need custom predicates: `filterBy(values, { BType: (b) => b.data > 10 })`

### Removed

- `narrow()` - Functionality merged into `filter()` for simpler API

### Migration Guide

```typescript
// Before
const filtered = helpers.narrow(values, 'BType');
// After
const filtered = helpers.filter(values, 'BType');

// Before (with predicates)
const filtered = helpers.filter(values, {
  BType: (b) => b.data > 10
});
// After
const filtered = helpers.filterBy(values, {
  BType: (b) => b.data > 10
});
```

## [1.0.0] - 2025-10-17

### Added

- Initial release
- Type guards (`is{Type}`)
- Pattern matching (`when`, `match`)
- Transformations (`map`)
- Array operations (`filter`, `narrow`)
- Utilities (`fold`, `partition`, `getType`, `constructor`)
