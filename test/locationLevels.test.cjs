const { test } = require('node:test');
const assert = require('node:assert/strict');

const { src } = require('./harness.cjs');

const { getLocLevels, locationAtLevel } = src('util/searcher-utils.jsx');

const MAX_LEVELS = 'location.Location.MaxLevels';

const modulesManager = ({ conf = {}, refs = {} } = {}) => ({
  getConf: (module, key, defaultValue = null) => {
    const moduleCfg = conf[module] || {};
    return moduleCfg[key] !== undefined ? moduleCfg[key] : defaultValue;
  },
  getRef: (key) => refs[key],
});

const chain = (...names) => names.reduce((parent, name) => ({ name, parent }), null);

// The searchers render column i of n with locationAtLevel(location, n - i - 1).
const columns = (location, levels) => Array.from({ length: levels }, (_, i) => locationAtLevel(location, levels - i - 1));

test('getLocLevels reads the fe-location configuration first', () => {
  const mm = modulesManager({ conf: { 'fe-location': { [MAX_LEVELS]: 3 } }, refs: { [MAX_LEVELS]: '4' } });
  assert.equal(getLocLevels(mm), 3);
});

test('getLocLevels falls back to the ref, then to 4', () => {
  assert.equal(getLocLevels(modulesManager({ refs: { [MAX_LEVELS]: '3' } })), 3);
  assert.equal(getLocLevels(modulesManager({ refs: { [MAX_LEVELS]: '4' } })), 4);
  assert.equal(getLocLevels(modulesManager()), 4);
});

test('getLocLevels ignores values that are not a positive integer', () => {
  for (const value of [0, -1, 2.5, 'abc', '', null, true]) {
    const mm = modulesManager({ conf: { 'fe-location': { [MAX_LEVELS]: value } }, refs: { [MAX_LEVELS]: value } });
    assert.equal(getLocLevels(mm), 4, `value ${JSON.stringify(value)}`);
  }
});

test('location columns at 4 levels render as before, anchored on the lowest level', () => {
  assert.deepEqual(columns(chain('R', 'D', 'W', 'V'), 4), ['R', 'D', 'W', 'V']);
  assert.deepEqual(columns(chain('R', 'D', 'W'), 4), ['', 'R', 'D', 'W']);
  assert.deepEqual(columns(null, 4), ['', '', '', '']);
});

test('location columns follow the configured level count', () => {
  assert.deepEqual(columns(chain('P', 'C', 'H'), 3), ['P', 'C', 'H']);
  assert.deepEqual(columns(chain('P', 'C', 'Z', 'H'), 4), ['P', 'C', 'Z', 'H']);
});
