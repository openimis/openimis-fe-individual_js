/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@openimis/fe-core/testing';
import { GROUP_CHANGELOG_TAB_VALUE } from '../constants';
import { GroupChangelogTabLabel, GroupChangelogTabPanel } from './GroupChangelogTab';

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

function HistorySearcher({ groupId }) {
  return <div data-testid="history-searcher">{groupId}</div>;
}

function tabs(group) {
  return (
    <div>
      <GroupChangelogTabLabel
        intl={intl}
        onChange={noop}
        tabStyle={tabStyle}
        isSelected={isSelected}
        group={group}
      />
      <GroupChangelogTabPanel value={GROUP_CHANGELOG_TAB_VALUE} group={group} />
    </div>
  );
}

describe('GroupChangelogTab', () => {
  it('does not query history until the group has an id', () => {
    modulesManager.getRef = (ref) => (ref === 'individual.GroupHistorySearcher' ? HistorySearcher : null);
    const { rerender } = renderWithProviders(tabs({}));

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('history-searcher')).not.toBeInTheDocument();

    rerender(tabs(null));
    rerender(tabs({ id: '7' }));
    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(screen.getByTestId('history-searcher')).toHaveTextContent('7');
  });
});
