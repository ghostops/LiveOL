#!/usr/bin/env node

/**
 * Script to extract all translation keys from the codebase and generate a source locale file.
 * 
 * This script:
 * 1. Scans all TypeScript/JavaScript files in the App/src directory
 * 2. Extracts translation keys from t('key') calls
 * 3. Generates a JSON file with all unique keys (values are the keys themselves)
 * 
 * Note: This app uses FLAT translation keys only (no nested structures).
 * All keys are simple strings like "My Key" or "key.with.dots" (where dots are part of the string).
 * 
 * Usage: node scripts/generate-source-locale.js [output-file]
 * Default output: App/assets/locales/source.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.join(__dirname, '../src');
const DEFAULT_OUTPUT = path.join(__dirname, '../assets/locales/source.json');
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Regex patterns to match translation calls
const PATTERNS = [
  // t('string') or t("string")
  /\bt\(\s*['"]([^'"]+)['"]\s*\)/g,
  // t(`string`)
  /\bt\(\s*`([^`]+)`\s*\)/g,
];

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract translation keys from file content
 * All keys are treated as flat strings (dots are part of the key name, not nesting)
 */
function extractKeysFromContent(content) {
  const keys = new Set();

  PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1];
      // Include all keys as-is (flat structure)
      // Keys like "competitions.info" are treated as single flat keys
      if (key) {
        keys.add(key);
      }
    }
  });

  return Array.from(keys);
}

/**
 * Main function
 */
function main() {
  const outputFile = process.argv[2] || DEFAULT_OUTPUT;

  console.log('🔍 Scanning files for translation keys...');
  console.log(`📁 Source directory: ${SOURCE_DIR}`);

  // Get all files
  const files = getAllFiles(SOURCE_DIR);
  console.log(`📄 Found ${files.length} files to scan`);

  // Extract all keys
  const allKeys = new Set();
  let processedFiles = 0;

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const keys = extractKeysFromContent(content);
      
      if (keys.length > 0) {
        keys.forEach(key => allKeys.add(key));
        processedFiles++;
        console.log(`  ✓ ${path.relative(SOURCE_DIR, file)}: ${keys.length} keys`);
      }
    } catch (error) {
      console.error(`  ✗ Error reading ${file}: ${error.message}`);
    }
  });

  console.log(`\n✅ Processed ${processedFiles} files with translations`);
  console.log(`🔑 Found ${allKeys.size} unique translation keys`);

  // Create output object with keys as both key and value
  const output = {};
  Array.from(allKeys)
    .sort()
    .forEach(key => {
      output[key] = key;
    });

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output file
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  console.log(`\n💾 Source locale file generated: ${outputFile}`);
  console.log('✨ Done!');
}

// Run the script
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = { extractKeysFromContent, getAllFiles };
