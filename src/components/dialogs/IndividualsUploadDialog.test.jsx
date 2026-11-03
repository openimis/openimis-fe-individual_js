/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  renderWithProviders, makeStore, screen, userEvent,
} from '@openimis/fe-core/testing';

// The fe-core barrel cannot be loaded on its own from a test. SelectInput keeps
// fe-core's contract: the option whose JSON matches the value is shown, any other
// value shows as empty (SelectInput.jsx, OP-3185).
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  return {
    apiHeaders: {},
    baseApiUrl: '/api',
    useModulesManager: () => ({ getConf: (module, key, fallback) => fallback }),
    formatMessage: (intl, module, id) => id,
    coreAlert: () => ({ type: 'CORE_ALERT' }),
    FormattedMessage: ({ id }) => id,
    withHistory: (component) => component,
    historyPush: () => {},
    SelectInput: ({ options, value, onChange }) => {
      const current = value === null || value === undefined ? '' : JSON.stringify(value);
      const optionValues = options.map((o) => (o.value === null ? '' : JSON.stringify(o.value)));
      return ReactActual.createElement(
        'select',
        {
          'aria-label': 'workflow',
          value: optionValues.includes(current) ? current : '',
          onChange: (e) => onChange(e.target.value === '' ? null : JSON.parse(e.target.value)),
        },
        ReactActual.createElement('option', { value: '' }, ''),
        ...options.map((o, i) => ReactActual.createElement('option', { key: i, value: optionValues[i] }, o.label)),
      );
    },
  };
});
vi.mock('./IndividualsHistoryUploadDialog', () => ({ default: () => null }));
vi.mock('../../actions', () => ({ fetchWorkflows: () => ({ type: 'TEST_FETCH_WORKFLOWS' }) }));

const { default: IndividualsUploadDialog } = await import('./IndividualsUploadDialog');

const WORKFLOWS = [
  { name: 'Python Import Individuals', group: 'individual' },
  { name: 'Python Update Individuals', group: 'individual' },
];

describe('IndividualsUploadDialog workflow picker', () => {
  // The dialog passed the picker a function as its value, so the chosen workflow
  // never matched an option and the dropdown stayed empty, though the upload worked.
  it('shows the workflow that was picked', async () => {
    const store = makeStore({
      reducers: { socialProtection: (state = { workflows: WORKFLOWS }) => state },
    });
    renderWithProviders(<IndividualsUploadDialog />, { store });

    await userEvent.click(screen.getByText('individual.upload.buttonLabel'));
    const picker = screen.getByRole('combobox', { name: 'workflow' });
    await userEvent.selectOptions(picker, 'Python Update Individuals');

    expect(picker).toHaveDisplayValue('Python Update Individuals');
  });
});
