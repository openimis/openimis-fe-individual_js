/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, makeStore, screen } from '@openimis/fe-core/testing';

// Records the props connect() maps from the store, which GroupMenu does not render.
const { connected } = vi.hoisted(() => ({ connected: { props: null } }));

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal();
  const ReactActual = (await import('react')).default;
  return {
    ...actual,
    connect: (mapStateToProps, mapDispatchToProps) => (Component) => actual.connect(
      mapStateToProps,
      mapDispatchToProps,
    )((props) => {
      connected.props = props;
      return ReactActual.createElement(Component, props);
    }),
  };
});

// The fe-core barrel cannot be loaded on its own from a test.
vi.mock('@openimis/fe-core', () => ({
  useModulesManager: () => ({ getRef: (key) => key }),
  formatMessage: (intl, module, id) => id,
  coreAlert: () => ({ type: 'CORE_ALERT' }),
  withHistory: (component) => component,
  historyPush: () => {},
}));
vi.mock('../../actions', () => ({ fetchWorkflows: () => ({ type: 'TEST_FETCH_WORKFLOWS' }) }));

const { default: GroupMenu } = await import('./GroupMenu');

const WORKFLOWS = [{ name: 'Python Import Groups', group: 'individual' }];

describe('GroupMenu', () => {
  // OP-3350: GroupMenu read state.socialProtection.workflows, although it
  // dispatches individual's own fetchWorkflows, whose result is in
  // state.individual.workflows. Without SocialProtectionModule it crashed.
  it('receives the individual workflows without SocialProtectionModule', () => {
    const store = makeStore({
      reducers: { individual: (state = { workflows: WORKFLOWS }) => state },
    });
    renderWithProviders(<GroupMenu />, { store });

    expect(screen.getByText('individual.enrollment.buttonLabel')).toBeInTheDocument();
    expect(connected.props.workflows).toBe(WORKFLOWS);
  });
});
