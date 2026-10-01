import React from 'react';

// eslint-disable-next-line import/prefer-default-export
export const applyNumberCircle = (number) => (
  <div style={{
    color: '#ffffff',
    backgroundColor: '#006273',
    borderRadius: '50%',
    padding: '5px',
    minWidth: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '12px',
    width: '20px',
    height: '45px',
    marginTop: '7px',
  }}
  >
    {number}
  </div>
);

export const DEFAULT_LOC_LEVELS = 4;
const LOCATION_MAX_LEVELS_KEY = 'location.Location.MaxLevels';

const parseLocLevels = (value) => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const levels = Number(value);
  return Number.isInteger(levels) && levels > 0 ? levels : null;
};

// Number of location columns: the fe-location module configuration key
// location.Location.MaxLevels, then the ref of the same name, then 4.
export const getLocLevels = (modulesManager) => (
  parseLocLevels(modulesManager.getConf('fe-location', LOCATION_MAX_LEVELS_KEY))
  ?? parseLocLevels(modulesManager.getRef(LOCATION_MAX_LEVELS_KEY))
  ?? DEFAULT_LOC_LEVELS
);

export const locationAtLevel = (lowestLevelLoc, level) => {
  let location = lowestLevelLoc;
  let levelDiff = level;

  while (levelDiff > 0 && location) {
    location = location.parent;
    levelDiff -= 1;
  }

  return location ? location.name : '';
};
