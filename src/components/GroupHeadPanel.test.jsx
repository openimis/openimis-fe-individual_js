/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@openimis/fe-core/testing';

// The fe-core barrel cannot be loaded from a test: stub only the exports this panel
// reaches. Published components report the props they were given.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;

  class FormPanel extends ReactActual.Component {
    updateAttribute = () => {};
  }

  return {
    FormPanel,
    formatMessage: (intl, module, id) => `${module}.${id}`,
    FormattedMessage: ({ id }) => id,
    TextInput: () => null,
    PublishedComponent: ({ pubRef, entityType, entityId }) => ReactActual.createElement('div', {
      'data-testid': pubRef,
      'data-entity-type': entityType ?? '',
      'data-entity-id': entityId ?? '',
    }),
    withModulesManager: (component) => component,
  };
});

const { default: GroupHeadPanel } = await import('./GroupHeadPanel');

describe('GroupHeadPanel', () => {
  // OP-3279: a group with a pending task cannot be updated until the task is resolved.
  it('shows the pending tasks of the group', () => {
    renderWithProviders(<GroupHeadPanel edited={{ id: 'group-uuid' }} rights={[]} />);

    const count = screen.getByTestId('tasksManagement.PendingTaskCount');
    expect(count.dataset.entityType).toBe('individual.group');
    expect(count.dataset.entityId).toBe('group-uuid');
  });
});
