#!/usr/bin/env node

/**
 * Syncs version from src/version.ts to package.json
 * Runs automatically before builds to keep versions in sync
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read version.ts and extract VERSION constant
const versionTsPath = join(rootDir, 'src', 'version.ts');
const versionTsContent = readFileSync(versionTsPath, 'utf8');
const versionMatch = versionTsContent.match(/export const VERSION = ["'](.+?)["']/);

if (!versionMatch) {
  console.error('❌ Could not extract VERSION from src/version.ts');
  process.exit(1);
}

const version = versionMatch[1];

// Read and update package.json
const packageJsonPath = join(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

if (packageJson.version === version) {
  console.log(`✓ Version already synced: ${version}`);
  process.exit(0);
}

packageJson.version = version;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✓ Synced version to package.json: ${version}`);
