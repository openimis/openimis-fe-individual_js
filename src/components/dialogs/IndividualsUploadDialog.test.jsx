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
    // The label shows fe-core's translation key, formatMessage(intl, module, label).
    SelectInput: ({
      options, value, onChange, module, label,
    }) => {
      const current = value === null || value === undefined ? '' : JSON.stringify(value);
      const optionValues = options.map((o) => (o.value === null ? '' : JSON.stringify(o.value)));
      return ReactActual.createElement(
        'label',
        null,
        ReactActual.createElement('span', null, label ? `${module}.${label}` : null),
        ReactActual.createElement(
          'select',
          {
            'aria-label': 'workflow',
            value: optionValues.includes(current) ? current : '',
            onChange: (e) => onChange(e.target.value === '' ? null : JSON.parse(e.target.value)),
          },
          ReactActual.createElement('option', { value: '' }, ''),
          ...options.map((o, i) => ReactActual.createElement('option', { key: i, value: optionValues[i] }, o.label)),
        ),
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
      reducers: { individual: (state = { workflows: WORKFLOWS }) => state },
    });
    renderWithProviders(<IndividualsUploadDialog />, { store });

    await userEvent.click(screen.getByText('individual.upload.buttonLabel'));
    const picker = screen.getByRole('combobox', { name: 'workflow' });
    await userEvent.selectOptions(picker, 'Python Update Individuals');

    expect(picker).toHaveDisplayValue('Python Update Individuals');
  });

  // OP-3350: the dialog read state.socialProtection.workflows, although it
  // dispatches individual's own fetchWorkflows, whose result is in
  // state.individual.workflows. Without SocialProtectionModule it crashed.
  it('lists the individual workflows without SocialProtectionModule', async () => {
    const store = makeStore({
      reducers: { individual: (state = { workflows: WORKFLOWS }) => state },
    });
    renderWithProviders(<IndividualsUploadDialog />, { store });

    await userEvent.click(screen.getByText('individual.upload.buttonLabel'));
    const picker = screen.getByRole('combobox', { name: 'workflow' });

    expect([...picker.options].map((option) => option.text)).toEqual([
      '',
      'Python Import Individuals',
      'Python Update Individuals',
    ]);
  });

  // OP-3350: the picker took its label from the socialProtection translations, so
  // without SocialProtectionModule the field showed a raw key instead of "Workflow".
  it('labels the workflow picker with an individual translation', async () => {
    const store = makeStore({
      reducers: { individual: (state = { workflows: WORKFLOWS }) => state },
    });
    renderWithProviders(<IndividualsUploadDialog />, { store });

    await userEvent.click(screen.getByText('individual.upload.buttonLabel'));

    expect(screen.getByText('individual.upload.workflowPicker')).toBeTruthy();
  });
});
