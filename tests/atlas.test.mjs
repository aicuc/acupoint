import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { channels, catalog } from '../src/data/catalog.js';
import { initialPoints, extraPoints } from '../src/data/points.js';
import { associations } from '../src/scene/effects.js';
import { createHuman, nearestSurface } from '../src/scene/human-model.js';
import * as THREE from '../src/vendor/three.module.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function normalizePoints() {
  return [
    ...initialPoints.map((pt) => ({
      code: pt.code,
      name: pt.name,
      region: pt.region,
      pos: pt.pos,
      location: pt.location,
    })),
    ...extraPoints.map(([code, name, _pinyin, region, x, y, z, location]) => ({
      code,
      name,
      region,
      pos: [x, y, z],
      location,
    })),
  ];
}

test('repository layout contains standard project files at root', () => {
  for (const relPath of [
    'index.html',
    'package.json',
    'LICENSE',
    'README.md',
    '.nojekyll',
    'assets/preview.png',
    'licenses/HUMAN-MODEL-LICENSE.txt',
    'licenses/THREE-LICENSE.txt',
    'src/main.js',
    'src/styles/main.css',
  ]) {
    assert.equal(fs.existsSync(path.join(ROOT_DIR, relPath)), true, `Expected ${relPath} to exist`);
  }
});

test('meridian catalog covers 14 channels and 361 unique acupoint codes', () => {
  assert.equal(channels.length, 14);
  assert.equal(catalog.length, 361);

  const channelCodes = new Set();
  for (const ch of channels) {
    assert.ok(ch.code && ch.name && ch.route, `Channel missing metadata: ${JSON.stringify(ch)}`);
    assert.match(ch.color, /^#[0-9a-f]{6}$/i, `Invalid channel color on ${ch.code}`);
    assert.ok(Array.isArray(ch.names) && ch.names.length > 0, `Channel ${ch.code} has no points`);
    assert.equal(channelCodes.has(ch.code), false, `Duplicate channel code ${ch.code}`);
    channelCodes.add(ch.code);
  }

  const catalogCodes = new Set();
  for (const item of catalog) {
    assert.ok(channelCodes.has(item.channel), `Unknown channel ${item.channel} on ${item.code}`);
    assert.equal(catalogCodes.has(item.code), false, `Duplicate catalog code ${item.code}`);
    catalogCodes.add(item.code);
  }
});

test('3D acupoint dataset has 152 unique points with valid bounding-box coordinates', () => {
  const allPoints = normalizePoints();
  assert.equal(allPoints.length, 152);

  const seenCodes = new Set();
  for (const pt of allPoints) {
    assert.ok(pt.code && pt.name && pt.region && pt.location, `Point missing fields: ${JSON.stringify(pt)}`);
    assert.equal(seenCodes.has(pt.code), false, `Duplicate 3D acupoint code ${pt.code}`);
    seenCodes.add(pt.code);

    assert.equal(Array.isArray(pt.pos) && pt.pos.length === 3, true, `${pt.code}.pos must be a 3D vector`);
    const [x, y, z] = pt.pos;
    for (const [axis, value] of [['x', x], ['y', y], ['z', z]]) {
      assert.equal(Number.isFinite(value), true, `${pt.code}.${axis} must be finite`);
    }
    assert.ok(x >= -4 && x <= 4, `${pt.code}.x out of bounds: ${x}`);
    assert.ok(y >= 0 && y <= 8.5, `${pt.code}.y out of bounds: ${y}`);
    assert.ok(z >= -2 && z <= 2, `${pt.code}.z out of bounds: ${z}`);
  }
});

test('traditional symptom associations map to valid codes and 3D targets', () => {
  const pointCodes = new Set(normalizePoints().map((pt) => pt.code));
  const entries = Object.entries(associations);
  assert.equal(entries.length, 149);

  for (const [code, data] of entries) {
    assert.ok(pointCodes.has(code), `Association ${code} is not in 3D points dataset`);
    assert.ok(data.kind && data.note, `Association ${code} missing kind or note`);
    assert.ok(Array.isArray(data.targets) && data.targets.length > 0, `Association ${code} missing targets`);

    for (const [label, coords] of data.targets) {
      assert.equal(typeof label, 'string', `Invalid target label in ${code}`);
      assert.equal(Array.isArray(coords) && coords.length === 3, true, `Invalid coords in ${code}`);
      assert.equal(coords.every(Number.isFinite), true, `Non-finite coords in ${code}`);
    }
  }
});

test('human base mesh builds cleanly and surface projection returns valid hit', () => {
  const human = createHuman();
  assert.ok(human && human.geometry, 'createHuman() must return a Three.js mesh');

  const posAttr = human.geometry.getAttribute('position');
  assert.ok(posAttr && posAttr.count > 10000, 'Human geometry should contain dense vertex positions');

  const hit = nearestSurface(human, new THREE.Vector3(0.45, 5.4, 0.4));
  assert.ok(hit && hit.point && hit.normal, 'nearestSurface() must return point and normal');
  assert.equal(Number.isFinite(hit.point.x) && Number.isFinite(hit.point.y) && Number.isFinite(hit.point.z), true);
  assert.ok(Math.abs(hit.normal.length() - 1) < 0.05, 'Surface normal should be normalized');
});
