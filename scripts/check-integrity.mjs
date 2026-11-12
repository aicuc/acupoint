/**
 * Verifies static HTML entry references, relative ES module imports,
 * and JavaScript syntax across the codebase without external dependencies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function fail(message) {
  errors.push(message);
}

function collectJsFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsFiles(fullPath));
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      results.push(fullPath);
    }
  }
  return results;
}

function checkHtmlReferences() {
  const htmlPath = path.join(ROOT_DIR, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    fail('Missing root index.html');
    return;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const assetRefs = [...html.matchAll(/\b(?:href|src)="(\.?\/[^"?#]+|[^":?#]+\.(?:css|js|mjs))(?:\?[^"]*)?"/g)];
  for (const match of assetRefs) {
    const rawRef = match[1];
    if (rawRef === './' || rawRef.startsWith('http://') || rawRef.startsWith('https://')) continue;
    const target = path.resolve(ROOT_DIR, rawRef);
    if (!fs.existsSync(target)) {
      fail(`index.html references missing asset: ${rawRef}`);
    }
  }

  const importMapMatch = html.match(/<script\s+type="importmap">([\s\S]*?)<\/script>/);
  if (!importMapMatch) {
    fail('index.html is missing the ES module importmap');
    return;
  }

  try {
    const importMap = JSON.parse(importMapMatch[1]);
    for (const [specifier, mappedPath] of Object.entries(importMap.imports || {})) {
      const target = path.resolve(ROOT_DIR, mappedPath);
      if (!fs.existsSync(target)) {
        fail(`importmap "${specifier}" points to missing file: ${mappedPath}`);
      }
    }
  } catch (err) {
    fail(`Invalid importmap JSON in index.html: ${err.message}`);
  }
}

function checkModuleImportsAndSyntax(files) {
  const importRe = /\bimport\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;

  for (const filePath of files) {
    const rel = path.relative(ROOT_DIR, filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    for (const match of content.matchAll(importRe)) {
      const specifier = match[1];
      if (!specifier.startsWith('.')) continue;
      const target = path.resolve(path.dirname(filePath), specifier);
      if (!fs.existsSync(target)) {
        fail(`${rel} imports missing relative module: ${specifier}`);
      }
    }

    const syntaxCheck = spawnSync(process.execPath, ['--check', filePath], { encoding: 'utf8' });
    if (syntaxCheck.status !== 0) {
      fail(`Syntax error in ${rel}: ${syntaxCheck.stderr.trim()}`);
    }
  }
}

checkHtmlReferences();

const sourceFiles = [
  ...collectJsFiles(path.join(ROOT_DIR, 'src')),
  ...collectJsFiles(path.join(ROOT_DIR, 'scripts')),
  ...collectJsFiles(path.join(ROOT_DIR, 'tests')),
];

checkModuleImportsAndSyntax(sourceFiles);

if (errors.length > 0) {
  console.error('Integrity checks failed:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(`Integrity checks passed across index.html and ${sourceFiles.length} JS/MJS modules.`);
