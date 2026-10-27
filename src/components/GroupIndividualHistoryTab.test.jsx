/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@openimis/fe-core/testing';
import { GROUP_INDIVIDUAL_HISTORY_TAB_VALUE } from '../constants';
import { GroupIndividualHistoryTabLabel, GroupIndividualHistoryTabPanel } from './GroupIndividualHistoryTab';

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

// Like fe-core's Searcher, which reads defaultFilters only when it mounts.
const mounts = [];
function MountOnlyHistorySearcher(props) {
  const [mountedWith] = React.useState(() => {
    mounts.push(props);
    return props;
  });
  return <div data-testid="group-history-searcher">{mountedWith.individualId}</div>;
}

function tabs(individual) {
  return (
    <div>
      <GroupIndividualHistoryTabLabel
        intl={intl}
        onChange={noop}
        tabStyle={tabStyle}
        isSelected={isSelected}
        individual={individual}
      />
      <GroupIndividualHistoryTabPanel value={GROUP_INDIVIDUAL_HISTORY_TAB_VALUE} individual={individual} />
    </div>
  );
}

describe('GroupIndividualHistoryTab', () => {
  // OCM-1143: the individual starts as {}, so the searcher mounted without an
  // individual filter and a Search after load listed every group membership.
  it('does not query group history until the individual has an id', () => {
    modulesManager.getRef = (ref) => (
      ref === 'individual.GroupIndividualHistorySearcher' ? MountOnlyHistorySearcher : null
    );
    mounts.length = 0;
    const { rerender } = renderWithProviders(tabs({}));

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('group-history-searcher')).not.toBeInTheDocument();

    rerender(tabs(null));
    rerender(tabs(undefined));
    expect(screen.queryByTestId('group-history-searcher')).not.toBeInTheDocument();

    rerender(tabs({ id: 'x' }));
    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(screen.getByTestId('group-history-searcher')).toHaveTextContent('x');
    expect(mounts).toHaveLength(1);
    expect(mounts[0].individualId).toBe('x');
  });
});
