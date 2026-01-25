# Translation Management Scripts

This directory contains scripts for managing translation keys in the LiveOL app.

**Important**: This app uses **FLAT translation keys only**. All keys are simple strings like `"My Key"` or `"Competition information"`. If a key contains dots (e.g., `"key.with.dots"`), those dots are part of the key name, not nested structure.

## Scripts

### 1. Generate Source Locale (`generate-source-locale.js`)

Automatically extracts all translation keys used in the codebase and generates a source locale file.

#### What it does

The script:
1. Scans all TypeScript/JavaScript files in `App/src/`
2. Finds all calls to the translation function `t('...')`
3. Extracts the translation keys
4. Generates a JSON file with all unique keys

#### Usage

```bash
# From the App directory
npm run generate-source-locale

# Or with a custom output path
node scripts/generate-source-locale.js path/to/output.json
```

#### Default output location

The script generates `App/assets/locales/source.json` by default.

#### Output format

The generated file contains all translation keys as both keys and values:

```json
{
  "Add Runner": "Add Runner",
  "Cancel": "Cancel",
  "Close": "Close",
  "Error": "Error",
  ...
}
```

### 2. Analyze Locales (`analyze-locales.js`)

Analyzes translation coverage and identifies issues across all locale files.

#### What it does

The script:
1. Extracts all translation keys from the source code
2. Compares them with all locale files
3. Generates a comprehensive report showing:
   - Translation coverage for each language
   - Keys used in code but missing from locales
   - Keys in locales but not used in code (potentially dead code)
   - Statistics for each locale file

#### Usage

```bash
# From the App directory
npm run analyze-locales
```

#### Example output

```
📊 Locale Analysis

🔍 Keys found in source code: 104

📋 Locale Files Summary:

Locale  | Total Keys | Translated | Coverage | Unused | Missing
--------|------------|------------|----------|--------|--------
sv      |        207 |        207 |   100.0% |    122 |      19
en      |        207 |        207 |   100.0% |    122 |      19
de      |        207 |        129 |    62.3% |    122 |      19
...
```

## Use cases

1. **Initial locale setup**: Use the source file as a template for new language translations
2. **Translation tracking**: Compare the source file with existing locale files to find missing translations
3. **Localization platform**: Upload the source file to translation management platforms
4. **Documentation**: Keep track of all translatable strings in your app
5. **Quality assurance**: Use the analyze script to ensure all translations are up to date

## How the extraction works

The scripts use regular expressions to find translation function calls in your code:

- `t('string')` - Single quotes
- `t("string")` - Double quotes  
- `t(\`string\`)` - Template literals
- Supports keys with interpolation like `t('Hello {{name}}')`

**All keys are treated as flat strings**. There is no nesting - a key like `"competitions.info"` (if it existed) would be a single flat key where the dots are part of the key name.

## Files scanned

- `.ts` - TypeScript files
- `.tsx` - TypeScript React components
- `.js` - JavaScript files
- `.jsx` - JavaScript React components

## Example workflow

1. Make changes to your code that add new translation keys
2. Run `npm run analyze-locales` to see what's missing
3. Run `npm run generate-source-locale` to update the source file
4. Add missing keys to your locale files (sv.json, en.json, etc.)
5. Run `npm run analyze-locales` again to verify everything is in sync
6. Send updated locale files to translators or upload to your localization platform

## Notes

- The source generator only extracts keys, not the translation values
- Keys with template interpolation (`{{variable}}`) are preserved as-is
- The output is sorted alphabetically for easier diffing and version control
- The analyzer helps identify dead code (unused translation keys)
