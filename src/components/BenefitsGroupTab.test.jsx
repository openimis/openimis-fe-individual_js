/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@openimis/fe-core/testing';
import { BENEFITS_CONTRIBUTION_KEY, BENEFITS_TAB_VALUE } from '../constants';
import { BenefitsGroupTabLabel, BenefitsGroupTabPanel } from './BenefitsGroupTab';

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

function BenefitSearcher({ individualUuid }) {
  return <div data-testid="benefit-searcher">{individualUuid ?? ''}</div>;
}

function tabs(group) {
  return (
    <div>
      <BenefitsGroupTabLabel
        intl={intl}
        onChange={noop}
        tabStyle={tabStyle}
        isSelected={isSelected}
        group={group}
      />
      <BenefitsGroupTabPanel value={BENEFITS_TAB_VALUE} group={group} />
    </div>
  );
}

describe('BenefitsGroupTab', () => {
  it('does not query benefits until the group has an id', () => {
    modulesManager.getRef = (ref) => (ref === BENEFITS_CONTRIBUTION_KEY ? BenefitSearcher : null);
    const { rerender } = renderWithProviders(tabs({}));

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('benefit-searcher')).not.toBeInTheDocument();

    rerender(tabs({ id: '7' }));
    expect(screen.getByRole('tab')).toBeInTheDocument();
    expect(screen.getByTestId('benefit-searcher')).toHaveTextContent('');

    rerender(tabs({ id: '7', head: { uuid: 'head-1' } }));
    expect(screen.getByTestId('benefit-searcher')).toHaveTextContent('head-1');
  });
});
