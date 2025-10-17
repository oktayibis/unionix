# Publishing Guide for ts-unios

## Prerequisites

1. Create an npm account at https://www.npmjs.com/signup
2. Login to npm:
   ```bash
   npm login
   ```

## Pre-publish Checklist

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Version number updated in `package.json`
- [ ] README.md is up-to-date
- [ ] CHANGELOG.md created (optional)

## Publishing to npm

### First Time Setup

1. **Choose a package name**: Update the `name` field in `package.json` if `ts-unios` is taken:
   ```json
   {
     "name": "@your-username/ts-unios"
   }
   ```

2. **Verify package contents**:
   ```bash
   npm pack --dry-run
   ```
   This shows what files will be included in the package.

### Publishing Steps

1. **Clean and rebuild**:
   ```bash
   npm run build
   npm test
   ```

2. **Publish to npm**:
   ```bash
   npm publish
   ```

   For scoped packages (e.g., `@your-username/ts-unios`):
   ```bash
   npm publish --access public
   ```

3. **Verify publication**:
   Visit: https://www.npmjs.com/package/ts-unios

## Publishing to GitHub Packages

1. **Create a `.npmrc` file** in the project root:
   ```
   @your-username:registry=https://npm.pkg.github.com
   ```

2. **Update package.json**:
   ```json
   {
     "name": "@your-username/ts-unios",
     "repository": {
       "type": "git",
       "url": "git+https://github.com/your-username/ts-unios.git"
     },
     "publishConfig": {
       "registry": "https://npm.pkg.github.com"
     }
   }
   ```

3. **Authenticate with GitHub**:
   ```bash
   npm login --registry=https://npm.pkg.github.com
   ```
   Use your GitHub username and a Personal Access Token with `write:packages` scope.

4. **Publish**:
   ```bash
   npm publish
   ```

## Version Management

Use semantic versioning (semver):

- **Patch** (bug fixes): `npm version patch` → 1.0.0 → 1.0.1
- **Minor** (new features): `npm version minor` → 1.0.1 → 1.1.0
- **Major** (breaking changes): `npm version major` → 1.1.0 → 2.0.0

Example:
```bash
npm version patch
git push --follow-tags
npm publish
```

## Creating a Git Tag

```bash
# Commit all changes
git add .
git commit -m "Release v1.0.0"

# Create tag
git tag v1.0.0

# Push with tags
git push origin main --tags
```

## GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" → "Draft a new release"
3. Choose the tag you created
4. Add release notes
5. Publish release

## Automated Publishing with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish Package

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm test
      - run: npm run build

      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Add your npm token to GitHub Secrets:
1. Get token from https://www.npmjs.com/settings/tokens
2. Add as `NPM_TOKEN` in GitHub repository secrets

## Post-publish

1. **Verify installation**:
   ```bash
   mkdir test-install
   cd test-install
   npm init -y
   npm install ts-unios
   ```

2. **Test the installed package**:
   ```typescript
   import { create } from 'ts-unios';
   // Test basic functionality
   ```

3. **Update documentation** if needed

4. **Announce the release** (optional):
   - Twitter
   - Reddit (r/typescript)
   - Dev.to
   - Your blog

## Troubleshooting

### Package name already taken
- Use a scoped package: `@your-username/ts-unios`
- Choose a different name

### "You must be logged in"
```bash
npm login
```

### "You do not have permission"
- Check package name
- Verify you're logged in: `npm whoami`
- For scoped packages, use `--access public`

### Files not included
- Check `.npmignore`
- Check `files` field in `package.json`
- Use `npm pack --dry-run` to verify

## Maintenance

- Keep dependencies updated
- Respond to issues
- Review pull requests
- Publish security patches promptly
- Maintain semantic versioning
