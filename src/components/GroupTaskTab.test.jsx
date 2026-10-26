/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@openimis/fe-core/testing';
import { GROUP_LABEL, GROUP_TASK_TAB_VALUE, TASK_CONTRIBUTION_KEY } from '../constants';
import { GroupTaskTabLabel, GroupTaskTabPanel } from './GroupTaskTab';

const { modulesManager } = vi.hoisted(() => ({
  modulesManager: {
    getContribs: () => [],
    getRef: () => null,
  },
}));

// The fe-core barrel imports UserPicker before withModulesManager is initialized.
// useModulesManager still calls a real hook, so moving it below the guard fails this test.
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

function TaskSearcher({ entityIds }) {
  const shown = Array.isArray(entityIds) ? entityIds.join(',') : '';
  return <div data-testid="task-searcher">{shown}</div>;
}

// Like fe-core's Searcher, which reads defaultFilters only when it mounts:
// ids passed after mount are ignored.
const mountedWith = [];
function MountOnlyTaskSearcher({ entityIds }) {
  const [ids] = React.useState(() => {
    mountedWith.push(entityIds);
    return entityIds;
  });
  return <div data-testid="task-searcher">{ids.join(',')}</div>;
}

function tabs(group, groupIndividualIds = ['a', 'b']) {
  return (
    <div>
      <GroupTaskTabLabel
        intl={intl}
        onChange={noop}
        tabStyle={tabStyle}
        isSelected={isSelected}
        group={group}
      />
      <GroupTaskTabPanel
        value={GROUP_TASK_TAB_VALUE}
        group={group}
        groupIndividualIds={groupIndividualIds}
      />
    </div>
  );
}

describe('GroupTaskTab', () => {
  it('does not query tasks until the group has an id', () => {
    modulesManager.getContribs = (key) => (
      key === TASK_CONTRIBUTION_KEY ? [{ taskCode: GROUP_LABEL }] : []
    );
    modulesManager.getRef = (ref) => (ref === 'tasksManagement.taskSearcher' ? TaskSearcher : null);
    const { rerender } = renderWithProviders(tabs({}));

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('task-searcher')).not.toBeInTheDocument();

    rerender(tabs(null));
    rerender(tabs({ id: '7' }));
    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(screen.getByTestId('task-searcher')).toHaveTextContent('a,b');
  });

  // OP-3274 / OCM-1144: opened before the members load, the tab queried with
  // entityIds: [] (every task) and never picked up the ids that arrived later.
  it('queries the tasks of the members that load after the tab opens, never with no ids', () => {
    modulesManager.getContribs = (key) => (
      key === TASK_CONTRIBUTION_KEY ? [{ taskCode: GROUP_LABEL }] : []
    );
    modulesManager.getRef = (ref) => (ref === 'tasksManagement.taskSearcher' ? MountOnlyTaskSearcher : null);
    mountedWith.length = 0;
    const { rerender } = renderWithProviders(tabs({ id: '7' }, []));

    expect(screen.queryByTestId('task-searcher')).not.toBeInTheDocument();

    rerender(tabs({ id: '7' }, ['a', 'b']));
    expect(screen.getByTestId('task-searcher')).toHaveTextContent('a,b');

    rerender(tabs({ id: '7' }, ['c']));
    expect(screen.getByTestId('task-searcher')).toHaveTextContent('c');
    expect(mountedWith.filter((ids) => !ids?.length)).toEqual([]);
  });
});
