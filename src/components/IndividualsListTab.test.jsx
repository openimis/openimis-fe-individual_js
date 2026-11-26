/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@openimis/fe-core/testing';
import { INDIVIDUALS_LIST_TAB_VALUE } from '../constants';
import { IndividualsListTabPanel } from './IndividualsListTab';

// A modules manager with fe-core's refs (and individual's own) only:
// PolicyHolderModule is not installed, so policyHolder.TabPanel is not registered.
const { refs } = vi.hoisted(() => ({ refs: {} }));

vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  refs['core.TabPanel'] = ({ value, index, children }) => (
    value === index ? ReactActual.createElement('div', { 'data-testid': 'core-tab-panel' }, children) : null
  );
  refs['individual.GroupIndividualSearcher'] = ({ groupId }) => (
    ReactActual.createElement('div', { 'data-testid': 'group-individual-searcher' }, groupId)
  );
  return {
    formatMessage: (intl, module, id) => id,
    PublishedComponent: ({ pubRef, ...props }) => {
      const Component = refs[pubRef];
      return Component ? ReactActual.createElement(Component, props) : null;
    },
  };
});

describe('IndividualsListTabPanel', () => {
  it('renders its content through core.TabPanel without PolicyHolderModule', () => {
    renderWithProviders(<IndividualsListTabPanel value={INDIVIDUALS_LIST_TAB_VALUE} groupId="g-1" rights={[]} />);

    expect(screen.getByTestId('group-individual-searcher')).toHaveTextContent('g-1');
  });
});
