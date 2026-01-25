#!/usr/bin/env node

/**
 * Analyze translation keys across locale files and source code
 * 
 * This helps identify:
 * - Keys used in code but missing in locale files
 * - Keys in locale files but not used in code (potentially dead code)
 * - Coverage statistics for each locale
 * 
 * Note: This app uses FLAT translation keys only (no nested structures).
 * All keys are treated as simple strings.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../assets/locales');
const { extractKeysFromContent, getAllFiles } = require('./generate-source-locale');

function analyzeLocales() {
  console.log('📊 Locale Analysis\n');
  console.log('='.repeat(60));

  // Get keys from source code
  const SOURCE_DIR = path.join(__dirname, '../src');
  const files = getAllFiles(SOURCE_DIR);
  const codeKeys = new Set();
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const keys = extractKeysFromContent(content);
      keys.forEach(key => codeKeys.add(key));
    } catch (error) {
      // Skip files with errors
    }
  });

  console.log(`\n🔍 Keys found in source code: ${codeKeys.size}`);
  console.log('='.repeat(60));

  // Analyze each locale file
  const localeFiles = fs.readdirSync(LOCALES_DIR)
    .filter(f => f.endsWith('.json') && f !== 'source.json')
    .sort();

  const localeStats = {};

  localeFiles.forEach(file => {
    const filePath = path.join(LOCALES_DIR, file);
    const locale = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const localeKeys = Object.keys(locale);
    const localeName = file.replace('.json', '');

    // Count how many translations are present (not null)
    const translated = localeKeys.filter(key => locale[key] !== null).length;
    const coverage = (translated / localeKeys.length * 100).toFixed(1);

    // Find keys in locale but not in code
    const unusedKeys = localeKeys.filter(key => !codeKeys.has(key));
    
    // Find code keys missing from this locale
    const missingKeys = Array.from(codeKeys).filter(key => !localeKeys.includes(key));

    localeStats[localeName] = {
      totalKeys: localeKeys.length,
      translated,
      coverage: parseFloat(coverage),
      unusedKeys: unusedKeys.length,
      missingKeys: missingKeys.length,
    };
  });

  // Print summary table
  console.log('\n📋 Locale Files Summary:\n');
  console.log('Locale  | Total Keys | Translated | Coverage | Unused | Missing');
  console.log('--------|------------|------------|----------|--------|--------');
  
  Object.entries(localeStats)
    .sort((a, b) => b[1].coverage - a[1].coverage)
    .forEach(([locale, stats]) => {
      const name = locale.padEnd(7);
      const total = stats.totalKeys.toString().padStart(10);
      const trans = stats.translated.toString().padStart(10);
      const cov = `${stats.coverage}%`.padStart(8);
      const unused = stats.unusedKeys.toString().padStart(6);
      const missing = stats.missingKeys.toString().padStart(7);
      
      console.log(`${name} | ${total} | ${trans} | ${cov} | ${unused} | ${missing}`);
    });

  // Detailed analysis
  console.log('\n' + '='.repeat(60));
  console.log('📖 Detailed Analysis\n');

  // Show keys in sv.json (reference) but not in code
  const svPath = path.join(LOCALES_DIR, 'sv.json');
  if (fs.existsSync(svPath)) {
    const sv = JSON.parse(fs.readFileSync(svPath, 'utf-8'));
    const svKeys = Object.keys(sv);
    const unusedInSv = svKeys.filter(key => !codeKeys.has(key));

    if (unusedInSv.length > 0) {
      console.log(`⚠️  Keys in sv.json but NOT found in code (${unusedInSv.length}):`);
      console.log('   (These might be unused or accessed differently)\n');
      unusedInSv.slice(0, 10).forEach(key => {
        console.log(`   - "${key}"`);
      });
      if (unusedInSv.length > 10) {
        console.log(`   ... and ${unusedInSv.length - 10} more`);
      }
      console.log();
    }
  }

  // Show keys in code but not in sv.json
  const sv = JSON.parse(fs.readFileSync(svPath, 'utf-8'));
  const svKeys = Object.keys(sv);
  const missingInSv = Array.from(codeKeys).filter(key => !svKeys.includes(key));

  if (missingInSv.length > 0) {
    console.log(`❌ Keys in code but NOT in sv.json (${missingInSv.length}):`);
    console.log('   (These need to be added to locale files)\n');
    missingInSv.forEach(key => {
      console.log(`   - "${key}"`);
    });
    console.log();
  }

  console.log('='.repeat(60));
  console.log('✨ Analysis complete!\n');
}

if (require.main === module) {
  try {
    analyzeLocales();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
