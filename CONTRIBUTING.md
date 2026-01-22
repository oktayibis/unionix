# Contributing to unionix

Thank you for your interest in contributing to unionix!

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Project Structure

```
unionix/
├── src/
│   ├── index.ts          # Main library implementation
│   └── index.test.ts     # Comprehensive test suite
├── dist/                 # Build output (generated)
│   ├── index.js         # Compiled JavaScript
│   ├── index.d.ts       # Type declarations
│   └── *.map            # Source maps
├── .github/
│   └── workflows/
│       └── ci.yml       # GitHub Actions CI/CD
├── package.json         # Package configuration
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest configuration
├── README.md            # Documentation
├── LICENSE              # MIT License
└── example.ts           # Usage examples
```

## Testing

All new features must include tests. We aim for 80%+ code coverage.

```bash
npm test              # Run tests
npm test -- --watch   # Run tests in watch mode
npm test -- --coverage # Run tests with coverage
```

## Type Safety

This library is built with strict TypeScript settings. Ensure all code:
- Has no `any` types (except where absolutely necessary)
- Passes strict null checks
- Has proper type inference
- Includes JSDoc comments for public APIs

## Building

```bash
npm run build
```

This compiles TypeScript to JavaScript and generates type declarations in the `dist/` folder.

## Publishing

Before publishing:

1. Update version in `package.json`
2. Run tests: `npm test`
3. Build: `npm run build`
4. Publish: `npm publish`

## Code Style

- Use `readonly` for immutable properties
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for all exported functions and types
- Follow existing code patterns

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## Questions?

Feel free to open an issue for any questions or suggestions!
