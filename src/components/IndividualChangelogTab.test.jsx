/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@openimis/fe-core/testing';
import { INDIVIDUAL_CHANGELOG_TAB_VALUE } from '../constants';
import { IndividalChangelogTabLabel, IndividalChangelogTabPanel } from './IndividualChangelogTab';

const { modulesManager } = vi.hoisted(() => ({
  modulesManager: {
    getContribs: () => [],
    getRef: () => null,
  },
}));

// The fe-core barrel imports UserPicker before withModulesManager is initialized.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  const context = ReactActual.createContext(modulesManager);
  return {
    formatMessage: (intl, module, id) => (intl?.formatMessage ? intl.formatMessage({ id }) : id),
    useModulesManager: () => ReactActual.useContext(context),
    PublishedComponent: ({ pubRef, children, ...props }) => {
      if (pubRef === 'policyHolder.TabPanel') return ReactActual.createElement('div', null, children);
      const Component = modulesManager.getRef(pubRef);
      return Component ? ReactActual.createElement(Component, props) : null;
    },
  };
});

const intl = { messages: {}, formatMessage: ({ id }) => id };
const noop = () => {};
const tabStyle = () => 'tab';
const isSelected = () => false;

function HistorySearcher({ individualId }) {
  return <div data-testid="history-searcher">{individualId}</div>;
}

function tabs(individual) {
  return (
    <div>
      <IndividalChangelogTabLabel
        intl={intl}
        onChange={noop}
        tabStyle={tabStyle}
        isSelected={isSelected}
        individual={individual}
      />
      <IndividalChangelogTabPanel value={INDIVIDUAL_CHANGELOG_TAB_VALUE} individual={individual} />
    </div>
  );
}

describe('IndividualChangelogTab', () => {
  it('does not query history until the individual has an id', () => {
    modulesManager.getRef = (ref) => (
      ref === 'individual.IndividualHistorySearcher' ? HistorySearcher : null
    );
    const { rerender } = renderWithProviders(tabs(null));

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('history-searcher')).not.toBeInTheDocument();

    rerender(tabs(undefined));
    rerender(tabs({}));
    expect(screen.queryByTestId('history-searcher')).not.toBeInTheDocument();

    rerender(tabs({ id: '42' }));
    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(screen.getByTestId('history-searcher')).toHaveTextContent('42');
  });
});
