/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React, { useEffect } from 'react';
import { act, render as renderRaw } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  describe, expect, it, vi,
} from 'vitest';

// Counts how often each filter pane is mounted: a pane rebuilt on every render of its
// searcher loses whatever the user was typing or picking when a fetch lands.
const { mounts, mockFilter } = vi.hoisted(() => {
  const counts = {};
  return {
    mounts: counts,
    mockFilter: (name) => async () => {
      const ReactActual = (await import('react')).default;
      return {
        default: function Filter({ groupId }) {
          ReactActual.useEffect(() => {
            counts[name] = (counts[name] ?? 0) + 1;
          }, []);
          return ReactActual.createElement('span', { 'data-testid': name }, groupId);
        },
      };
    },
  };
});

vi.mock('@openimis/fe-core', () => ({
  GetIconComponent: (name) => function Icon() { return <span>{name}</span>; },
  formatMessage: (intl, module, key) => key,
  formatMessageWithValues: (intl, module, key) => key,
  formatDateFromISO: () => '',
  withModulesManager: (component) => component,
  withHistory: (component) => component,
  useModulesManager: () => ({ getRef: () => null, getConf: (m, k, d) => d }),
  useTranslations: () => ({
    formatMessage: (key) => key,
    formatMessageWithValues: (key) => key,
    formatDateFromISO: () => '',
  }),
  historyPush: vi.fn(),
  useHistory: () => ({ push: vi.fn(), location: {} }),
  downloadExport: vi.fn(),
  decodeId: (id) => id,
  coreConfirm: vi.fn(),
  coreAlert: vi.fn(),
  journalize: vi.fn(),
  // Renders the filter pane the way fe-core's Searcher does: as a component.
  Searcher: function Searcher({ FilterPane }) {
    return FilterPane ? <FilterPane filters={{}} onChangeFilters={() => {}} /> : null;
  },
}));

vi.mock('../actions', async (importOriginal) => {
  const actual = await importOriginal();
  return Object.fromEntries(Object.keys(actual).map((key) => [
    key,
    typeof actual[key] === 'function' ? vi.fn(() => ({ type: 'NOOP' })) : actual[key],
  ]));
});

vi.mock('./IndividualHistoryFilter', mockFilter('IndividualHistoryFilter'));
vi.mock('./GroupHistoryFilter', mockFilter('GroupHistoryFilter'));
vi.mock('./GroupIndividualHistoryFilter', mockFilter('GroupIndividualHistoryFilter'));
vi.mock('./GroupFilter', mockFilter('GroupFilter'));
vi.mock('./GroupIndividualFilter', mockFilter('GroupIndividualFilter'));

const { IndividualHistorySearcher } = await import('./IndividualHistorySearcher');
const { GroupHistorySearcher } = await import('./GroupHistorySearcher');
const { GroupIndividualHistorySearcher } = await import('./GroupIndividualHistorySearcher');
const { GroupSearcher } = await import('./GroupSearcher');
const { GroupIndividualSearcher } = await import('./GroupIndividualSearcher');

// state.individual, whose fetching flags the test flips like a fetch would.
const makeIndividualStore = () => configureStore({
  reducer: {
    individual: (state = {}, action) => (
      action.type === 'FETCHING' ? { ...state, [action.key]: action.value } : state
    ),
  },
});

// Dialogs inside the searchers read the store and the translations.
const render = (ui) => {
  const store = makeIndividualStore();
  return renderRaw(ui, {
    wrapper: ({ children }) => (
      <Provider store={store}><IntlProvider locale="en">{children}</IntlProvider></Provider>
    ),
  });
};

const baseProps = {
  intl: {},
  modulesManager: { getRef: () => null, getConf: (m, k, d) => d },
  history: {},
  rights: [],
  coreConfirm: vi.fn(),
  coreAlert: vi.fn(),
  journalize: vi.fn(),
  clearConfirm: vi.fn(),
  confirmed: null,
};

describe('searcher filter panes survive a fetch', () => {
  it.each([
    ['IndividualHistorySearcher', IndividualHistorySearcher, 'IndividualHistoryFilter',
      { individualHistory: [], fetchIndividualHistory: vi.fn(), individualId: 'i-1' }, 'fetchingIndividualHistory'],
    ['GroupSearcher', GroupSearcher, 'GroupFilter',
      { groups: [], fetchGroups: vi.fn(), deleteGroup: vi.fn() }, 'fetchingGroups'],
    ['GroupIndividualSearcher', GroupIndividualSearcher, 'GroupIndividualFilter',
      {
        groupIndividuals: [], groupId: 'group-1', fetchGroupIndividuals: vi.fn(), clearGroupIndividuals: vi.fn(),
      }, 'fetchingGroupIndividuals'],
  ])('%s keeps its filter pane mounted while results load', (name, Component, filter, props, fetchingProp) => {
    const all = { ...baseProps, ...props };
    const view = render(<Component {...all} />);
    view.rerender(<Component {...all} {...{ [fetchingProp]: true }} />);
    view.rerender(<Component {...all} {...{ [fetchingProp]: false }} />);

    expect(mounts[filter]).toBe(1);
  });

  it.each([
    ['GroupHistorySearcher', GroupHistorySearcher, 'GroupHistoryFilter', { groupId: 'group-1' }, 'fetchingGroupHistory'],
    ['GroupIndividualHistorySearcher', GroupIndividualHistorySearcher, 'GroupIndividualHistoryFilter',
      { individualId: 'i-1' }, 'fetchingGroupIndividualHistory'],
  ])('%s keeps its filter pane mounted while results load', (name, Component, filter, props, fetchingKey) => {
    const store = makeIndividualStore();
    render(<Provider store={store}><Component {...props} /></Provider>);
    act(() => store.dispatch({ type: 'FETCHING', key: fetchingKey, value: true }));
    act(() => store.dispatch({ type: 'FETCHING', key: fetchingKey, value: false }));

    expect(mounts[filter]).toBe(1);
  });

  it('still gives the group members filter its group', () => {
    const view = render(
      <GroupIndividualSearcher {...baseProps} groupIndividuals={[]} groupId="group-7" fetchGroupIndividuals={vi.fn()} />,
    );

    expect(view.getByTestId('GroupIndividualFilter').textContent).toBe('group-7');
  });
});
