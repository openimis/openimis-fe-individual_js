import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { applyNumberCircle, locationAtLevel, LOC_LEVELS } from './searcher-utils';

// Built lowest-level-last, the way the searchers receive it: each location knows
// its parent, and the row holds the deepest one.
const village = { name: 'Village', parent: { name: 'Ward', parent: { name: 'District', parent: { name: 'Region' } } } };

describe('locationAtLevel', () => {
  it('counts levels upwards from the location it was given', () => {
    expect(locationAtLevel(village, 0)).toBe('Village');
    expect(locationAtLevel(village, 1)).toBe('Ward');
    expect(locationAtLevel(village, 2)).toBe('District');
    expect(locationAtLevel(village, 3)).toBe('Region');
  });

  it('runs out of ancestors quietly', () => {
    expect(locationAtLevel(village, LOC_LEVELS)).toBe('');
    expect(locationAtLevel(village, 99)).toBe('');
  });

  it('reads a shallow hierarchy as far as it goes', () => {
    const region = { name: 'Region' };

    expect(locationAtLevel(region, 0)).toBe('Region');
    expect(locationAtLevel(region, 1)).toBe('');
  });

  it.each([
    ['no location', undefined],
    ['a null location', null],
  ])('returns an empty string for %s', (_label, location) => {
    expect(locationAtLevel(location, 0)).toBe('');
    expect(locationAtLevel(location, 2)).toBe('');
  });

  it('fills the searcher columns top down when the caller inverts the level', () => {
    const columns = Array.from({ length: LOC_LEVELS }, (_, i) => locationAtLevel(village, LOC_LEVELS - i - 1));

    expect(columns).toEqual(['Region', 'District', 'Ward', 'Village']);
  });
});

describe('applyNumberCircle', () => {
  it('renders the number it is given', () => {
    render(applyNumberCircle(7));

    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders a zero rather than nothing', () => {
    const { container } = render(applyNumberCircle(0));

    expect(container.firstChild).toHaveTextContent('0');
  });
});
